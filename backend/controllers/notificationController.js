const Notification = require('../models/Notification');

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = { sentBy: req.user.id };
    } else {
      query = {
        $or: [
          { recipients: 'all' },
          { recipients: { $regex: req.user.id } },
        ],
      };
    }

    const notifications = await Notification.find(query)
      .populate('sentBy', 'name')
      .sort('-createdAt')
      .limit(50);

    // Mark which are read
    const withReadStatus = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.includes(req.user.id),
    }));

    res.json({ success: true, count: notifications.length, data: withReadStatus });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Send notification (admin only)
 * @route   POST /api/notifications
 */
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, recipients } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || 'General',
      sentBy: req.user.id,
      recipients: recipients || 'all',
    });

    await notification.populate('sentBy', 'name');
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user.id } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipients: 'all' }, { recipients: { $regex: req.user.id } }] },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete notification (admin)
 * @route   DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (notification.sentBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await notification.deleteOne();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};
