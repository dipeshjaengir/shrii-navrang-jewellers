const mongoose = require('mongoose');
const JsonModel = require('../config/jsonDbHelper');

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

let ReviewModel;
try {
  ReviewModel = mongoose.model('Review', reviewSchema);
} catch (e) {
  ReviewModel = mongoose.model('Review');
}

const jsonReviewModel = new JsonModel('Review');

module.exports = new Proxy({}, {
  get: function(target, prop) {
    const activeModel = global.useJsonDb ? jsonReviewModel : ReviewModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});
