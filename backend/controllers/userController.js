const User = require('../models/User');
const Room = require('../models/Room');
const redisClient = require('../config/redis');

/**
 * @desc    Get all students (admin only)
 * @route   GET /api/users
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .populate('room', 'roomNumber floor type')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({ success: true, count: users.length, total, data: users });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('room');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user (admin can update role/room; student can update profile)
 * @route   PUT /api/users/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'profileImage'];
    if (req.user.role === 'admin') allowedFields.push('role', 'isActive');

    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    }).populate('room');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await redisClient.del('stats:users');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/users/:id
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Remove from room if allocated
    if (user.room) {
      await Room.findByIdAndUpdate(user.room, {
        $pull: { students: user._id },
        $inc: { occupied: -1 },
      });
      await redisClient.del('stats:rooms');
    }

    await user.deleteOne();
    await redisClient.del('stats:users');
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get dashboard stats (admin)
 * @route   GET /api/users/stats
 */
exports.getStats = async (req, res, next) => {
  try {
    const cached = await redisClient.get('stats:users');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), source: 'cache' });
    }

    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });

    const statsData = { totalStudents, activeStudents };
    await redisClient.setEx('stats:users', 300, JSON.stringify(statsData));

    res.json({ success: true, data: statsData, source: 'db' });
  } catch (err) {
    next(err);
  }
};
