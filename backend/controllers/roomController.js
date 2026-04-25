const Room = require('../models/Room');
const User = require('../models/User');
const Payment = require('../models/Payment');
const redisClient = require('../config/redis');

/**
 * @desc    Get all rooms
 * @route   GET /api/rooms
 */
exports.getRooms = async (req, res, next) => {
  try {
    const { status, floor } = req.query;
    const query = {};
    if (status) query.status = status;
    if (floor) query.floor = floor;

    const rooms = await Room.find(query).populate('students', 'name email phone').sort('roomNumber');
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single room
 * @route   GET /api/rooms/:id
 */
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('students', 'name email phone');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create room
 * @route   POST /api/rooms
 * @access  Admin
 */
exports.createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    await redisClient.del('stats:rooms');
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update room
 * @route   PUT /api/rooms/:id
 * @access  Admin
 */
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('students', 'name email');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await redisClient.del('stats:rooms');
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete room
 * @route   DELETE /api/rooms/:id
 * @access  Admin
 */
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.occupied > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied room' });
    }
    await room.deleteOne();
    await redisClient.del('stats:rooms');
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Allocate student to a room
 * @route   POST /api/rooms/:id/allocate
 * @access  Admin
 */
exports.allocateRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.occupied >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is at full capacity' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Remove from old room if any
    if (student.room) {
      await Room.findByIdAndUpdate(student.room, {
        $pull: { students: studentId },
        $inc: { occupied: -1 },
      });
    }

    // Add to new room
    room.students.addToSet(studentId);
    room.occupied = room.students.length;
    await room.save();

    student.room = room._id;
    await student.save();

    // Create first payment record
    const now = new Date();
    await Payment.create({
      student: studentId,
      room: room._id,
      amount: room.rent,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      status: 'Pending',
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
    });

    const populated = await Room.findById(room._id).populate('students', 'name email phone');
    await redisClient.del('stats:rooms');
    await redisClient.del('stats:payments');
    res.json({ success: true, data: populated, message: 'Room allocated successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove student from room
 * @route   POST /api/rooms/:id/deallocate
 * @access  Admin
 */
exports.deallocateRoom = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    room.students.pull(studentId);
    room.occupied = room.students.length;
    await room.save();

    await User.findByIdAndUpdate(studentId, { room: null });
    await redisClient.del('stats:rooms');
    res.json({ success: true, message: 'Student removed from room' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get room statistics
 * @route   GET /api/rooms/stats
 */
exports.getRoomStats = async (req, res, next) => {
  try {
    const cachedStats = await redisClient.get('stats:rooms');
    if (cachedStats) {
      return res.json({ success: true, data: JSON.parse(cachedStats), source: 'cache' });
    }

    const total = await Room.countDocuments();
    const available = await Room.countDocuments({ status: 'Available' });
    const occupied = await Room.countDocuments({ status: { $in: ['Occupied', 'Full'] } });
    const maintenance = await Room.countDocuments({ status: 'Maintenance' });

    const statsData = { total, available, occupied, maintenance };
    
    // Cache for 5 minutes
    await redisClient.setEx('stats:rooms', 300, JSON.stringify(statsData));

    res.json({ success: true, data: statsData, source: 'db' });
  } catch (err) {
    next(err);
  }
};
