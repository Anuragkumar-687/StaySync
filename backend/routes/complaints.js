const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getComplaints, getComplaint, createComplaint,
  updateComplaint, deleteComplaint, getComplaintStats,
} = require('../controllers/complaintController');

router.use(protect);

router.get('/stats', getComplaintStats);
router.route('/').get(getComplaints).post(createComplaint);
router.route('/:id').get(getComplaint).put(updateComplaint).delete(deleteComplaint);

module.exports = router;
