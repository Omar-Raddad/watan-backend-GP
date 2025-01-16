const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  addCheckpoint,
  updateCheckpointStatus,
  addReview,
  getNearbyCheckpoints,
  getCheckpointDetails,
  addMultipleCheckpoints
} = require('../controllers/checkpointController');

const router = express.Router();

// Add a new checkpoint (Admin only)
router.post('/', protect, addCheckpoint);
// Add multiple checkpoints (Admin only)
router.post('/bulk', addMultipleCheckpoints);

// Update checkpoint status (Admin only)
router.put('/:id/status', protect, updateCheckpointStatus);

// Add a review to a checkpoint
router.post('/:id/reviews', protect, addReview);

// Get nearby checkpoints
router.get('/nearby', getNearbyCheckpoints);

// Get details of a checkpoint
router.get('/:id', getCheckpointDetails);

module.exports = router;
