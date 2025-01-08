const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createPost,
  fetchPosts,
  reactToPost,
  addComment,
  fetchSinglePost,
  addReply,
  reactToReply,
  reactToComment
} = require('../controllers/postController');
const upload = require('../middlewares/uploadMiddleware');


const router = express.Router();
router.get('/:postId', protect, fetchSinglePost);

router.post('/', protect, upload.array('images', 5), createPost);
router.get('/', protect, fetchPosts); // Fetch all posts
router.put('/:postId/react', protect, reactToPost); // Add or Update Reaction
router.put('/:postId/comment/:commentId/reaction', protect, reactToComment); // React to comment
router.put('/:postId/comment/:commentId/reply/:replyId/reaction', protect, reactToReply); // React to reply

router.post('/:postId/comment', protect, addComment); // Add a comment
router.post('/:postId/comment/:commentId/reply', protect, addReply); // Add a reply to a comment

module.exports = router;
