const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/userController');  // Import the controller functions

// Route for user login
router.post('/login', loginUser);

// Route for user registration
router.post('/register', registerUser);

module.exports = router;
