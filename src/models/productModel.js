const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: null, // Null if it's an occasion instead of a regular product
  },
  occasion: {
    type: Boolean,
    default: false, // True if it's an occasion product
  },
  images: [
    {
      type: String, // URLs or paths of uploaded product images
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // References the Category schema
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User who created the product
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
