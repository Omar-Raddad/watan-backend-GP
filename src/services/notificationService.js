const admin = require('../utils/firebase');
const Notification = require('../models/notificationModel');

const saveNotification = async (userId, title, body, type, data = {}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      body,
      type,
      data,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error saving notification:', error);
    throw error;
  }
};
const sendPurchaseNotification = async (receiverToken, buyerName, productName, data = {}) => {
  // Ensure all values in the `data` object are strings
  const stringData = Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = String(value); // Convert each value to a string
    return acc;
  }, {});

  const message = {
    notification: {
      title: `Product Purchased`,
      body: `${buyerName} purchased your product: ${productName}.`,
    },
    android: {
      notification: {
        icon: 'watan_icon',
        color: '#4CAF50',
      },
    },
    data: stringData,
    token: receiverToken,
  };

  return await admin.messaging().send(message);
};

const sendMessageNotification = async (receiverToken, senderName, messageText, data = {}) => {
  const message = {
    notification: {
      title: `New Message from ${senderName}`,
      body: messageText,
    },
    android: {
      notification: {
        icon: 'watan_icon',
        color: '#4CAF50',
      },
    },
    data,
    token: receiverToken,
  };

  return await admin.messaging().send(message);
};

const sendPostInteractionNotification = async (receiverToken, postOwner, interactionType, data = {}) => {
  const message = {
    notification: {
      title: `Your post received a ${interactionType}`,
      body: `${postOwner} interacted with your post`,
    },
    android: {
      notification: {
        icon: 'watan_icon',
        color: '#FF5722',
      },
    },
    data,
    token: receiverToken,
  };

  return await admin.messaging().send(message);
};

const getUserNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

const clearAllNotifications = async (userId) => {
  return await Notification.deleteMany({ userId });
};

module.exports = {
  saveNotification,
  sendMessageNotification,
  sendPostInteractionNotification,
  getUserNotifications,
  markAsRead,
  clearAllNotifications,
  sendPurchaseNotification
};
