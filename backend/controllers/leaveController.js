const Leave = require('../models/Leave');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../config/redis');

/**
 * @desc    Apply for leave (student)
 * @route   POST /api/leaves/apply
 * @access  Student
 */
exports.applyLeave = async (req, res, next) => {
  try {
    const { reason, departureDate, returnDate } = req.body;

    if (!reason || !departureDate || !returnDate) {
      return res.status(400).json({ success: false, message: 'Reason, departure date, and return date are required' });
    }

    const leave = await Leave.create({
      student: req.user.id,
      reason,
      departureDate,
      returnDate,
    });

    await leave.populate('student', 'name email room');
    await redisClient.del('stats:leaves');
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get student's own leaves
 * @route   GET /api/leaves/my-leaves
 * @access  Student
 */
exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ student: req.user.id })
      .populate('student', 'name email')
      .populate('approvedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all leave requests (admin)
 * @route   GET /api/leaves
 * @access  Admin
 */
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('student', 'name email room phone')
      .populate({
        path: 'student',
        populate: { path: 'room', select: 'roomNumber' },
      })
      .populate('approvedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update leave status (approve/reject)
 * @route   PATCH /api/leaves/:id/status
 * @access  Admin
 */
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This leave has already been processed' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    if (adminNote) leave.adminNote = adminNote;

    // Generate unique QR token on approval
    if (status === 'Approved') {
      leave.qrToken = uuidv4();
    }

    await leave.save();
    await leave.populate('student', 'name email');
    await leave.populate('approvedBy', 'name');
    await redisClient.del('stats:leaves');

    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify QR code at gate (security guard)
 * @route   GET /api/leaves/verify/:token
 * @access  Public (guard scanner)
 */
exports.verifyGatePass = async (req, res, next) => {
  try {
    const { token } = req.params;

    const leave = await Leave.findOne({ qrToken: token })
      .populate('student', 'name email phone')
      .populate({
        path: 'student',
        populate: { path: 'room', select: 'roomNumber' },
      });

    if (!leave) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid gate pass. No matching leave found.',
      });
    }

    if (leave.status !== 'Approved') {
      return res.json({
        success: true,
        valid: false,
        message: `Leave is ${leave.status}. Not approved for exit.`,
        data: { studentName: leave.student?.name, status: leave.status },
      });
    }

    // Check if within valid date range
    const now = new Date();
    const departure = new Date(leave.departureDate);
    const returnDate = new Date(leave.returnDate);
    departure.setHours(0, 0, 0, 0);
    returnDate.setHours(23, 59, 59, 999);

    if (now < departure || now > returnDate) {
      return res.json({
        success: true,
        valid: false,
        message: 'Gate pass has expired or is not yet active.',
        data: {
          studentName: leave.student?.name,
          departureDate: leave.departureDate,
          returnDate: leave.returnDate,
        },
      });
    }

    // Mark as scanned
    if (!leave.qrScannedAt) {
      leave.qrScannedAt = new Date();
      await leave.save();
    }

    res.json({
      success: true,
      valid: true,
      message: '✅ Gate pass verified. Student is approved to leave.',
      data: {
        studentName: leave.student?.name,
        studentEmail: leave.student?.email,
        phone: leave.student?.phone,
        room: leave.student?.room?.roomNumber || 'N/A',
        reason: leave.reason,
        departureDate: leave.departureDate,
        returnDate: leave.returnDate,
        scannedAt: leave.qrScannedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get leave stats (admin)
 * @route   GET /api/leaves/stats
 * @access  Admin
 */
exports.getLeaveStats = async (req, res, next) => {
  try {
    const cached = await redisClient.get('stats:leaves');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), source: 'cache' });
    }

    const [pending, approved, rejected, total] = await Promise.all([
      Leave.countDocuments({ status: 'Pending' }),
      Leave.countDocuments({ status: 'Approved' }),
      Leave.countDocuments({ status: 'Rejected' }),
      Leave.countDocuments(),
    ]);

    const statsData = { pending, approved, rejected, total };
    await redisClient.setEx('stats:leaves', 300, JSON.stringify(statsData));

    res.json({ success: true, data: statsData, source: 'db' });
  } catch (err) {
    next(err);
  }
};
