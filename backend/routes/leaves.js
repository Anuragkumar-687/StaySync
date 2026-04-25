const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  verifyGatePass,
  getLeaveStats,
} = require('../controllers/leaveController');

// Public route — guard scanner
router.get('/verify/:token', verifyGatePass);

// Protected routes
router.use(protect);

router.get('/stats', authorize('admin'), getLeaveStats);
router.get('/my-leaves', getMyLeaves);
router.post('/apply', applyLeave);
router.get('/', authorize('admin'), getAllLeaves);
router.patch('/:id/status', authorize('admin'), updateLeaveStatus);

module.exports = router;
