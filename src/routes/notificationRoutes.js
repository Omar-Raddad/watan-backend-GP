const express = require('express');
const notificationController = require('../controllers/notifactionController');
const router = express.Router();

// Send a notification for a new message
router.post('/message', notificationController.sendMessageNotification);

router.post('/purchase', notificationController.sendPurchaseNotification);

// Send a notification for a like or comment on a post
router.post('/post-interaction', notificationController.sendPostInteractionNotification);

// Fetch all notifications for a user
router.get('/:userId', notificationController.getUserNotifications);

// Mark a specific notification as read
router.put('/read/:notificationId', notificationController.markNotificationAsRead);

// Clear all notifications for a user
router.delete('/clear/:userId', notificationController.clearUserNotifications);

module.exports = router;
