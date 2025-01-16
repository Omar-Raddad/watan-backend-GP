// messagingController.js
const Conversation = require('../models/conversationModel');
const Message = require('../models/messagingModel');
const User = require('../models/userModel');
const admin = require('../utils/firebase'); 

// Start a Conversation
exports.startConversationWithProductOwner = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    // Check if a conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      // Create a new conversation
      conversation = new Conversation({
        participants: [req.user._id, receiverId],
      });
      await conversation.save();
    }

    // Create the initial message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content,
    });
    await message.save();

    res.status(200).json({ conversation, message });
  } catch (error) {
    res.status(500).json({ message: 'Error starting conversation', error });
  }
};


// Send a Message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content,
    });

    await message.save();

    // Get the other participant
    const receiverId = conversation.participants.find(
      (participant) => participant.toString() !== req.user._id.toString()
    );

    const receiver = await User.findById(receiverId);

    // Send FCM notification to the receiver
    if (receiver && receiver.fcmToken) {
      const payload = {
        notification: {
          title: 'New Message',
          body: content,
        },
        token: receiver.fcmToken,
      };

      try {
        await admin.messaging().send(payload);
        console.log('Message notification sent successfully');
      } catch (error) {
        console.error('Error sending FCM notification:', error);
      }
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};

// Get Conversation Messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', '_id username') // Explicitly populate both ID and username
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};
exports.startConversationWithProductOwner = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      // Create a new conversation
      conversation = new Conversation({
        participants: [req.user._id, receiverId],
      });
      await conversation.save();
    }

    // Create the initial message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content,
    });
    await message.save();

    res.status(200).json({ conversation, message });
  } catch (error) {
    res.status(500).json({ message: 'Error starting conversation', error });
  }
};



exports.getAllConversations = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', 'username email') // Populate participant details
      .sort({ createdAt: -1 }) // Sort conversations by newest first
      .lean(); // Convert mongoose documents to plain JavaScript objects

    // Attach the last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({ conversation: conversation._id })
          .sort({ createdAt: -1 }) // Get the most recent message
          .populate('sender', 'username email') // Populate sender details
          .lean();

        return {
          ...conversation,
          lastMessage: lastMessage || null, // Include the last message or null if no messages exist
        };
      })
    );

    res.status(200).json(conversationsWithLastMessage);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error });
  }
};

