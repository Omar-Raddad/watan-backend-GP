const mongoose = require('mongoose');
const reviewSchema = require('../models/reviewModel')

const checkpointSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  coordinates: { // Geolocation coordinates
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  mainStatus: { type: String, enum: ['Open', 'Closed'], required: true },
  secondaryStatus: {
    type: String,
    enum: ['Smooth', 'Moderate', 'Congested'],
    required: true,
  },
  reviews: [reviewSchema], // Embedded reviews
  history: [
    {
      status: { type: String },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

checkpointSchema.index({ coordinates: '2dsphere' }); // Index for geospatial queries

module.exports = mongoose.model('Checkpoint', checkpointSchema);
