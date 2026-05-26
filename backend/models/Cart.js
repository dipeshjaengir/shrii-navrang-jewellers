const mongoose = require('mongoose');
const JsonModel = require('../config/jsonDbHelper');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  products: [{
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

let CartModel;
try {
  CartModel = mongoose.model('Cart', cartSchema);
} catch (e) {
  CartModel = mongoose.model('Cart');
}

const jsonCartModel = new JsonModel('Cart');

module.exports = new Proxy({}, {
  get: function(target, prop) {
    const activeModel = global.useJsonDb ? jsonCartModel : CartModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});
