const fs = require('fs');
const path = require('path');

class JsonModel {
  constructor(modelName) {
    this.modelName = modelName;
    const folder = global.useJsonDbTestMode ? '../data_test' : '../data';
    this.filePath = path.join(__dirname, folder, `${modelName}.json`);
    this.initFile();
  }

  initFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    if (global.jsonDbInMemoryCache && global.jsonDbInMemoryCache[this.modelName]) {
      return global.jsonDbInMemoryCache[this.modelName];
    }
    this.initFile();
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`⚠️ [JSON-DB] Failed to read database file ${this.filePath}:`, e.message);
      return [];
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn(`⚠️ [JSON-DB] Failed to write database file ${this.filePath} (falling back to memory):`, e.message);
    }
    // Always update in-memory cache so that subsequent reads in this process see the updated data
    if (!global.jsonDbInMemoryCache) {
      global.jsonDbInMemoryCache = {};
    }
    global.jsonDbInMemoryCache[this.modelName] = data;
  }

  match(item, query) {
    if (!query) return true;
    for (let key in query) {
      const qVal = query[key];
      const iVal = item[key];

      if (qVal && typeof qVal === 'object') {
        if ('$in' in qVal && Array.isArray(qVal.$in)) {
          if (!qVal.$in.includes(iVal)) return false;
        } else if ('$gte' in qVal || '$lte' in qVal) {
          if ('$gte' in qVal && iVal < qVal.$gte) return false;
          if ('$lte' in qVal && iVal > qVal.$lte) return false;
        }
      } else if (key === 'email' && typeof iVal === 'string' && typeof qVal === 'string') {
        if (iVal.trim().toLowerCase() !== qVal.trim().toLowerCase()) return false;
      } else if (iVal !== qVal) {
        return false;
      }
    }
    return true;
  }

  async find(query = {}) {
    const list = this.read();
    let filtered = list.filter(item => this.match(item, query));
    
    // Return standard array with lightweight Mongoose chain shims
    const self = this;
    const chain = {
      data: filtered.map(item => self.wrapItem(item)),
      sort(sortOptions) {
        if (sortOptions) {
          const field = Object.keys(sortOptions)[0];
          const order = sortOptions[field];
          this.data.sort((a, b) => {
            if (a[field] < b[field]) return order === 1 ? -1 : 1;
            if (a[field] > b[field]) return order === 1 ? 1 : -1;
            return 0;
          });
        }
        return this;
      },
      populate() { return this; },
      limit(n) {
        this.data = this.data.slice(0, n);
        return this;
      },
      // support await directly on chain
      then(resolve) {
        resolve(this.data);
      }
    };
    return chain;
  }

  async findOne(query = {}) {
    const list = this.read();
    const found = list.find(item => this.match(item, query));
    return found ? this.wrapItem(found) : null;
  }

  async findById(id) {
    if (!id) return null;
    const list = this.read();
    const found = list.find(item => String(item._id) === String(id));
    return found ? this.wrapItem(found) : null;
  }

  async create(data) {
    const list = this.read();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11),
      ...data,
      createdAt: new Date().toISOString()
    };
    list.push(newItem);
    this.write(list);
    return this.wrapItem(newItem);
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const list = this.read();
    const idx = list.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return null;
    
    list[idx] = { ...list[idx], ...updateData };
    this.write(list);
    return this.wrapItem(list[idx]);
  }

  async findByIdAndDelete(id) {
    const list = this.read();
    const idx = list.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return null;
    
    const removed = list.splice(idx, 1)[0];
    this.write(list);
    return this.wrapItem(removed);
  }

  async updateOne(query, updateData) {
    const list = this.read();
    const idx = list.findIndex(item => this.match(item, query));
    if (idx === -1) return { nModified: 0 };
    
    list[idx] = { ...list[idx], ...updateData };
    this.write(list);
    return { nModified: 1 };
  }

  async countDocuments(query = {}) {
    const list = this.read();
    return list.filter(item => this.match(item, query)).length;
  }

  wrapItem(item) {
    const self = this;
    const itemCopy = JSON.parse(JSON.stringify(item));
    
    // Add standard mongoose .save() method
    Object.defineProperty(itemCopy, 'save', {
      value: async function() {
        const list = self.read();
        const idx = list.findIndex(x => String(x._id) === String(this._id));
        if (idx !== -1) {
          const toSave = { ...this };
          delete toSave.save; // avoid saving function itself
          list[idx] = toSave;
          self.write(list);
        }
        return this;
      },
      enumerable: false,
      writable: true
    });

    return itemCopy;
  }
}

module.exports = JsonModel;
