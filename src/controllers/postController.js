const Post = require('../models/postModel');

// Create a Post
// Create a Post with image uploads
const createPost = async (req, res) => {
    const { content } = req.body;
  
    try {
      // Process uploaded images
      const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
  
      const newPost = new Post({
        content,
        images: imageUrls, // Add uploaded images
        user: req.user.id, // req.user is set by the auth middleware
      });
  
      await newPost.save();
      res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create post', error: error.message });
    }
  };
  

// Fetch Posts
const fetchPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .populate('comments.user', 'username')
      .populate('comments.replies.user', 'username')
      .populate('reactions.user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};


// Like or Unlike Post
const likePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter((userId) => userId.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.status(200).json({ message: isLiked ? 'Post unliked' : 'Post liked', post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like/unlike post', error: error.message });
  }
};
const reactToPost = async (req, res) => {
  const { postId } = req.params;
  const { type } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the user has already reacted
    const existingReactionIndex = post.reactions.findIndex(
      (reaction) => reaction.user.toString() === req.user.id
    );

    if (existingReactionIndex >= 0) {
      // Remove the reaction if it matches the current type
      if (post.reactions[existingReactionIndex].type === type) {
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update the reaction type
        post.reactions[existingReactionIndex].type = type;
      }
    } else {
      // Add a new reaction
      post.reactions.push({ type, user: req.user.id });
    }

    await post.save();
    res.status(200).json({ message: 'Reaction updated', post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to react to post', error: error.message });
  }
};


// Add Comment
const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      text,
      user: req.user.id,
    };

    post.comments.push(comment);
    await post.save();

    // Populate user field in comments for updated post
    const updatedPost = await Post.findById(postId)
      .populate('user', 'username')
      .populate('comments.user', 'username')
      .populate('comments.replies.user', 'username');

    res.status(201).json({ message: 'Comment added', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};
const fetchSinglePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId)
      .populate('user', 'username')
      .populate('comments.user', 'username')
      .populate('comments.replies.user', 'username')
      .populate('reactions.user', 'username');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post', error: error.message });
  }
};


// Add Reply
const addReply = async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = {
      text,
      user: req.user.id,
    };

    comment.replies.push(reply);
    await post.save();

    res.status(201).json({ message: 'Reply added', post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reply', error: error.message });
  }
};

// React to Comment
const reactToComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { type } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Check if the user has already reacted
    const existingReactionIndex = comment.reactions.findIndex(
      (reaction) => reaction.user.toString() === req.user.id
    );

    if (existingReactionIndex >= 0) {
      // Remove the reaction if it matches the current type
      if (comment.reactions[existingReactionIndex].type === type) {
        comment.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update the reaction type
        comment.reactions[existingReactionIndex].type = type;
      }
    } else {
      // Add a new reaction
      comment.reactions.push({ type, user: req.user.id });
    }

    await post.save();
    res.status(200).json({ message: 'Reaction updated', comment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to react to comment', error: error.message });
  }
};

// React to Reply
const reactToReply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  const { type } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    // Check if the user has already reacted
    const existingReactionIndex = reply.reactions.findIndex(
      (reaction) => reaction.user.toString() === req.user.id
    );

    if (existingReactionIndex >= 0) {
      // Remove the reaction if it matches the current type
      if (reply.reactions[existingReactionIndex].type === type) {
        reply.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update the reaction type
        reply.reactions[existingReactionIndex].type = type;
      }
    } else {
      // Add a new reaction
      reply.reactions.push({ type, user: req.user.id });
    }

    await post.save();
    res.status(200).json({ message: 'Reaction updated', reply });
  } catch (error) {
    res.status(500).json({ message: 'Failed to react to reply', error: error.message });
  }
};

module.exports = {
  createPost,
  fetchPosts,
  likePost,
  addComment,
  addReply,
  reactToPost,
  fetchSinglePost,
  reactToReply,
  reactToComment
};
