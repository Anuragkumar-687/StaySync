const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRooms, getRoom, createRoom, updateRoom, deleteRoom,
  allocateRoom, deallocateRoom, getRoomStats,
} = require('../controllers/roomController');

router.use(protect);

router.get('/stats', authorize('admin'), getRoomStats);
router.route('/').get(getRooms).post(authorize('admin'), createRoom);
router.route('/:id').get(getRoom).put(authorize('admin'), updateRoom).delete(authorize('admin'), deleteRoom);
router.post('/:id/allocate', authorize('admin'), allocateRoom);
router.post('/:id/deallocate', authorize('admin'), deallocateRoom);

module.exports = router;
