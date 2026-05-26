const mongoose = require('mongoose');
const JsonModel = require('../config/jsonDbHelper');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [{
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: String }] // Can store string IDs or ObjectIds transparently
}, { timestamps: true });

let UserModel;
try {
  UserModel = mongoose.model('User', userSchema);
} catch (e) {
  UserModel = mongoose.model('User');
}

const jsonUserModel = new JsonModel('User');

module.exports = new Proxy({}, {
  get: function(target, prop) {
    const activeModel = global.useJsonDb ? jsonUserModel : UserModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});
