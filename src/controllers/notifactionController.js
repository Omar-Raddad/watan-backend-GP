const notificationService = require('../services/notificationService');
const User = require('../models/userModel');

exports.sendMessageNotification = async (req, res) => {
  const { receiverId, senderName, messageText } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.fcmToken) {
      return res.status(404).json({ message: 'Receiver not found or FCM token missing' });
    }

    const response = await notificationService.sendMessageNotification(
      receiver.fcmToken,
      senderName,
      messageText,
      { type: 'message', senderName }
    );

    await notificationService.saveNotification(
      receiverId,
      `New Message from ${senderName}`,
      messageText,
      'message',
      { senderName }
    );

    res.status(200).json({ message: 'Message notification sent successfully', response });
  } catch (error) {
    console.error('Error sending message notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.sendPurchaseNotification = async (req, res) => {
  const { receiverId, buyerName, productName, productId } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.fcmToken) {
      return res.status(404).json({ message: 'Receiver not found or FCM token missing' });
    }

    const response = await notificationService.sendPurchaseNotification(
      receiver.fcmToken,
      buyerName,
      productName,
      { type: 'purchase', productId: '12345' } // Ensure `productId` is a string
    );

    await notificationService.saveNotification(
      receiverId,
      'Product Purchased',
      `${buyerName} purchased your product: ${productName}.`,
      'purchase',
      { buyerName, productId }
    );

    res.status(200).json({ message: 'Purchase notification sent successfully', response });
  } catch (error) {
    console.error('Error sending purchase notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.sendPostInteractionNotification = async (req, res) => {
  const { receiverId, postOwner, interactionType } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.fcmToken) {
      return res.status(404).json({ message: 'Receiver not found or FCM token missing' });
    }

    const response = await notificationService.sendPostInteractionNotification(
      receiver.fcmToken,
      postOwner,
      interactionType,
      { type: interactionType }
    );

    await notificationService.saveNotification(
      receiverId,
      `Your post received a ${interactionType}`,
      `${postOwner} interacted with your post`,
      'post_interaction',
      { postOwner, interactionType }
    );

    res.status(200).json({ message: `${interactionType} notification sent successfully`, response });
  } catch (error) {
    console.error(`Error sending ${interactionType} notification:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await notificationService.getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const updatedNotification = await notificationService.markAsRead(notificationId);
    res.status(200).json({ message: 'Notification marked as read', updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.clearUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    await notificationService.clearAllNotifications(userId);
    res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
