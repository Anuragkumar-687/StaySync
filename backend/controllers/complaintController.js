const Complaint = require('../models/Complaint');
const { classifyComplaint } = require('../utils/classifier');
const redisClient = require('../config/redis');

/**
 * @desc    Get complaints
 * @route   GET /api/complaints
 * @access  Private (admin gets all, student gets own)
 */
exports.getComplaints = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};

    // Students see only their own complaints
    if (req.user.role === 'student') query.student = req.user.id;
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('student', 'name email room')
      .populate('room', 'roomNumber')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);
    res.json({ success: true, count: complaints.length, total, data: complaints });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single complaint
 * @route   GET /api/complaints/:id
 */
exports.getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email room')
      .populate('room', 'roomNumber');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Students can only view their own
    if (req.user.role === 'student' && complaint.student._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create complaint (AI classifies it)
 * @route   POST /api/complaints
 * @access  Student
 */
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // AI Classification
    const autoCategory = classifyComplaint(`${title} ${description}`);
    const finalCategory = category || autoCategory;

    const complaint = await Complaint.create({
      student: req.user.id,
      title,
      description,
      category: finalCategory,
      autoCategory,
      priority: priority || 'Medium',
      room: req.user.room || null,
    });

    await complaint.populate('student', 'name email');
    await redisClient.del('stats:complaints');
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update complaint status (admin) or description (student)
 * @route   PUT /api/complaints/:id
 */
exports.updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'admin') {
      const { status, adminNote, priority } = req.body;
      if (status) complaint.status = status;
      if (adminNote !== undefined) complaint.adminNote = adminNote;
      if (priority) complaint.priority = priority;
      if (status === 'Resolved') complaint.resolvedAt = new Date();
    } else {
      // Students can only edit pending complaints
      if (complaint.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Cannot edit a complaint once it is being processed' });
      }
      if (complaint.student.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      const { description } = req.body;
      if (description) complaint.description = description;
    }

    await complaint.save();
    await complaint.populate('student', 'name email');
    await redisClient.del('stats:complaints');
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete complaint
 * @route   DELETE /api/complaints/:id
 */
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (req.user.role === 'student' && complaint.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await complaint.deleteOne();
    await redisClient.del('stats:complaints');
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get complaint stats
 * @route   GET /api/complaints/stats
 */
exports.getComplaintStats = async (req, res, next) => {
  try {
    // Only cache admin stats (student stats are user-specific)
    const cacheKey = req.user.role === 'admin' ? 'stats:complaints' : null;
    if (cacheKey) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached), source: 'cache' });
      }
    }

    const query = req.user.role === 'student' ? { student: req.user.id } : {};
    const [pending, inProgress, resolved, total] = await Promise.all([
      Complaint.countDocuments({ ...query, status: 'Pending' }),
      Complaint.countDocuments({ ...query, status: 'In Progress' }),
      Complaint.countDocuments({ ...query, status: 'Resolved' }),
      Complaint.countDocuments(query),
    ]);

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const statsData = { pending, inProgress, resolved, total, categoryStats };

    if (cacheKey) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(statsData));
    }

    res.json({ success: true, data: statsData, source: 'db' });
  } catch (err) {
    next(err);
  }
};
