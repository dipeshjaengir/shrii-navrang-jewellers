const mongoose = require('mongoose');
const JsonModel = require('../config/jsonDbHelper');

const ratesSchema = new mongoose.Schema({
  gold24k: { type: Number, required: true },
  gold22k: { type: Number, required: true },
  silver: { type: Number, required: true },
  businessEmail: { type: String, default: 'info@shriinavrang.com' }
}, { timestamps: true });

let RatesModel;
try {
  RatesModel = mongoose.model('Rates', ratesSchema);
} catch (e) {
  RatesModel = mongoose.model('Rates');
}

const jsonRatesModel = new JsonModel('Rates');

module.exports = new Proxy({}, {
  get: function(target, prop) {
    const activeModel = global.useJsonDb ? jsonRatesModel : RatesModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});
