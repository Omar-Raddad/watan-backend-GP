const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User login
// User login
const loginUser = async (req, res) => {
  const { email, password, fcmToken } = req.body; // Add fcmToken to the request body

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log("user",user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log("isMatch",isMatch);

    // Update the user's FCM token
    if (fcmToken) {
      console.log("fcmToken",fcmToken);

      user.fcmToken = fcmToken;
      await user.save();
    }
    console.log("res",res);

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        city: user.city,
        location: user.location,
        gender: user.gender,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User registration
// User registration
const registerUser = async (req, res) => {
  const { username, email, password, city, location, gender, fcmToken } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = new User({ username, email, password, city, location, gender, fcmToken });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        city: newUser.city,
        location: newUser.location,
        gender: newUser.gender,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Fetch user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const { username, email, city, location } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.city = city || user.city;
    user.location = location || user.location;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




module.exports = { loginUser, registerUser,getUserProfile, updateUserProfile  };
