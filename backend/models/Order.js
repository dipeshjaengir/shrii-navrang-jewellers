const mongoose = require('mongoose');
const JsonModel = require('../config/jsonDbHelper');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  paymentDetails: {
    status: { type: String, default: 'Pending' },
    paymentMethod: { type: String, default: 'Card' },
    transactionId: { type: String }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Packed', 'Shipped', 'Delivered'],
    default: 'Processing'
  }
}, { timestamps: true });

let OrderModel;
try {
  OrderModel = mongoose.model('Order', orderSchema);
} catch (e) {
  OrderModel = mongoose.model('Order');
}

const jsonOrderModel = new JsonModel('Order');

module.exports = new Proxy({}, {
  get: function(target, prop) {
    const activeModel = global.useJsonDb ? jsonOrderModel : OrderModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});
