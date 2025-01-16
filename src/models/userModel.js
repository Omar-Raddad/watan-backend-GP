const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  city: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String, // Specifies GeoJSON type
      enum: ['Point'], // Limited to 'Point' for geospatial queries
      required: false,
      default: 'Point', // Default type

    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      default: [0, 0], // Default coordinates (longitude, latitude)

    },
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  fcmToken: {
    type: String, // To store the FCM token
    default: null,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
