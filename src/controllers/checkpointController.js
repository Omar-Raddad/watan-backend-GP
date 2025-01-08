const Checkpoint = require('../models/CheckpointModel');

// Add a new checkpoint
const addCheckpoint = async (req, res) => {
  const { name, coordinates, mainStatus, secondaryStatus } = req.body;

  try {
    const checkpoint = new Checkpoint({
      name,
      coordinates: { type: 'Point', coordinates },
      mainStatus,
      secondaryStatus,
      history: [{ status: `${mainStatus} - ${secondaryStatus}` }],
    });

    await checkpoint.save();
    res.status(201).json({ message: 'Checkpoint added successfully', checkpoint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update checkpoint status
const updateCheckpointStatus = async (req, res) => {
  const { id } = req.params;
  const { mainStatus, secondaryStatus } = req.body;

  try {
    const checkpoint = await Checkpoint.findById(id);
    if (!checkpoint) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }

    checkpoint.mainStatus = mainStatus;
    checkpoint.secondaryStatus = secondaryStatus;
    checkpoint.history.push({
      status: `${mainStatus} - ${secondaryStatus}`,
      updatedAt: new Date(),
    });

    await checkpoint.save();
    res.status(200).json({ message: 'Checkpoint status updated', checkpoint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a review
const addReview = async (req, res) => {
  const { id } = req.params;
  const { rating, text } = req.body;

  try {
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    // Validate checkpoint existence
    const checkpoint = await Checkpoint.findById(id);
    if (!checkpoint) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }

    // Add review
    const review = {
      user: req.user.id, // Assuming user is authenticated
      rating,
      text,
    };

    checkpoint.reviews.push(review);
    await checkpoint.save();

    res.status(201).json({ message: 'Review added successfully', checkpoint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Get checkpoints within proximity
const getNearbyCheckpoints = async (req, res) => {
  const { lng, lat, distance } = req.query;

  try {
    const checkpoints = await Checkpoint.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(distance) / 6378.1],
        },
      },
    });

    res.status(200).json({ checkpoints });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get checkpoint details
const getCheckpointDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const checkpoint = await Checkpoint.findById(id).populate('reviews.user', 'username');
    if (!checkpoint) {
      return res.status(404).json({ message: 'Checkpoint not found' });
    }

    res.status(200).json({ checkpoint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMultipleCheckpoints = async (req, res) => {
  const { checkpoints } = req.body;

  try {
    const newCheckpoints = checkpoints.map((checkpoint) => ({
      name: checkpoint.name,
      coordinates: { type: 'Point', coordinates: checkpoint.coordinates },
      mainStatus: checkpoint.mainStatus,
      secondaryStatus: checkpoint.secondaryStatus,
      history: [{ status: `${checkpoint.mainStatus} - ${checkpoint.secondaryStatus}` }],
    }));

    const insertedCheckpoints = await Checkpoint.insertMany(newCheckpoints);

    res.status(201).json({ message: 'Checkpoints added successfully', checkpoints: insertedCheckpoints });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addCheckpoint,
  updateCheckpointStatus,
  addReview,
  getNearbyCheckpoints,
  getCheckpointDetails,
  addMultipleCheckpoints
};
