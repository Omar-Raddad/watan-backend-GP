const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Routes
router.route('/')
  .get(getProducts)                          // Public: Fetch all products
  .post(protect, upload.array('images', 5), createProduct); // Authenticated: Create product w/ up to 5 images

router.route('/:id')
  .get(getProductById)     // Public: Get product by ID
  .put(protect, updateProduct)    // Authenticated: Update product
  .delete(protect, deleteProduct);// Authenticated: Delete product

module.exports = router;
