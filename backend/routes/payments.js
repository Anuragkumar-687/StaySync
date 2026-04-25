const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPayments, createPayment, updatePayment, getPaymentStats,
  getRevenueChart, createRazorpayOrder, verifyRazorpayPayment, downloadInvoice,
} = require('../controllers/paymentController');

router.use(protect);

router.get('/stats', getPaymentStats);
router.get('/revenue-chart', getRevenueChart);
router.route('/').get(getPayments).post(authorize('admin'), createPayment);
router.put('/:id', authorize('admin'), updatePayment);
router.post('/:id/create-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
