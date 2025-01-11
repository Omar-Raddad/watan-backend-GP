const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addSponsorship,
  getUserProducts,
  getSponsoredProducts,
} = require('../controllers/productController');

const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Routes
// Sponsorship routes
router.get('/user-products', protect, getUserProducts);

router.post('/add-sponsorship', protect, addSponsorship); // Add sponsorship to a product
router.get('/sponsored-products',protect, getSponsoredProducts);
router.route('/')
  .get(getProducts)                          // Public: Fetch all products
  .post(protect, upload.array('images', 5), createProduct); // Authenticated: Create product w/ up to 5 images

router.route('/:id')
  .get(getProductById)     // Public: Get product by ID
  .put(protect, updateProduct)    // Authenticated: Update product
  .delete(protect, deleteProduct);// Authenticated: Delete product

 // Fetch sponsored products

module.exports = router;
