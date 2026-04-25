const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification,
} = require('../controllers/notificationController');

router.use(protect);

router.route('/').get(getNotifications).post(authorize('admin'), createNotification);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
