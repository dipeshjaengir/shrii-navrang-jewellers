const mongoose = require('mongoose');
const JsonModel = require('../config/jsonDbHelper');

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  material: { type: String, enum: ['Gold', 'Silver', 'Diamond', 'Platinum'], required: true },
  weight: { type: String, required: true },
  gender: { type: String, enum: ['Women', 'Men', 'Unisex'], default: 'Women' },
  ratings: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

let ProductModel;
try {
  ProductModel = mongoose.model('Product', productSchema);
} catch (e) {
  ProductModel = mongoose.model('Product');
}

const jsonProductModel = new JsonModel('Product');

module.exports = new Proxy({}, {
  get: function(target, prop) {
    const activeModel = global.useJsonDb ? jsonProductModel : ProductModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});
