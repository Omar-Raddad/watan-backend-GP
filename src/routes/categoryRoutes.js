const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');

// Routes
router.route('/')
  .get(getCategories) // Public: Fetch all categories
  .post(protect, createCategory); // Protected: Create a new category (admin or authorized users)

router.route('/:id')
  .delete(protect, deleteCategory) // Protected: Delete a category
  .put(protect, updateCategory); // Protected: Update a category

module.exports = router;
