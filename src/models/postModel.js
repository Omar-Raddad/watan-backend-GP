const mongoose = require('mongoose');

// Reaction Schema
const reactionSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['like', 'love', 'angry', 'happy'] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Reply Schema
const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reactions: [reactionSchema],
  createdAt: { type: Date, default: Date.now },
});

// Comment Schema
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reactions: [reactionSchema],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

// Post Schema
const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactions: [reactionSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
