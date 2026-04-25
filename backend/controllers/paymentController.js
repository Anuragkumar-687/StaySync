const Payment = require('../models/Payment');
const User = require('../models/User');
const Room = require('../models/Room');
const redisClient = require('../config/redis');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get payments
 * @route   GET /api/payments
 */
exports.getPayments = async (req, res, next) => {
  try {
    const { status, studentId, month, year } = req.query;
    const query = {};

    if (req.user.role === 'student') query.student = req.user.id;
    else if (studentId) query.student = studentId;

    if (status) query.status = status;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payments = await Payment.find(query)
      .populate('student', 'name email')
      .populate('room', 'roomNumber')
      .sort('-createdAt');

    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create payment record
 * @route   POST /api/payments
 * @access  Admin
 */
exports.createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    await payment.populate('student', 'name email');
    await payment.populate('room', 'roomNumber');
    await redisClient.del('stats:payments');
    await redisClient.del('chart:revenue');
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update payment status (mark as paid)
 * @route   PUT /api/payments/:id
 * @access  Admin
 */
exports.updatePayment = async (req, res, next) => {
  try {
    const { status, paymentMethod, transactionId, notes } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (status) payment.status = status;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId) payment.transactionId = transactionId;
    if (notes) payment.notes = notes;
    if (status === 'Paid') payment.paidAt = new Date();

    await payment.save();
    await payment.populate('student', 'name email');
    await payment.populate('room', 'roomNumber');
    await redisClient.del('stats:payments');
    await redisClient.del('chart:revenue');
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get payment stats
 * @route   GET /api/payments/stats
 */
exports.getPaymentStats = async (req, res, next) => {
  try {
    const cached = await redisClient.get('stats:payments');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), source: 'cache' });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [paid, pending, overdue, totalRevenue] = await Promise.all([
      Payment.countDocuments({ status: 'Paid', month, year }),
      Payment.countDocuments({ status: 'Pending', month, year }),
      Payment.countDocuments({ status: 'Overdue' }),
      Payment.aggregate([
        { $match: { status: 'Paid', year } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const statsData = {
      paid, pending, overdue,
      totalRevenue: totalRevenue[0]?.total || 0,
      month, year,
    };

    await redisClient.setEx('stats:payments', 300, JSON.stringify(statsData));

    res.json({ success: true, data: statsData, source: 'db' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get monthly revenue data for charts
 * @route   GET /api/payments/revenue-chart
 */
exports.getRevenueChart = async (req, res, next) => {
  try {
    const cached = await redisClient.get('chart:revenue');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), source: 'cache' });
    }

    const year = new Date().getFullYear();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'Paid', year } },
      { $group: { _id: '$month', revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]);

    const chartData = monthNames.map((name, i) => {
      const found = revenueByMonth.find(r => r._id === i + 1);
      return { name, revenue: found ? found.revenue : 0 };
    });

    await redisClient.setEx('chart:revenue', 300, JSON.stringify(chartData));
    res.json({ success: true, data: chartData, source: 'db' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payments/:id/create-order
 * @access  Student
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
    }
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment = await Payment.findById(req.params.id)
      .populate('student', 'name email phone')
      .populate('room', 'roomNumber');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });

    const options = {
      amount: payment.amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `receipt_${payment._id.toString().slice(-8)}`,
      notes: {
        paymentId: payment._id.toString(),
        studentId: payment.student._id.toString(),
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({ success: true, data: { order, key: process.env.RAZORPAY_KEY_ID, payment } });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/payments/verify
 * @access  Student
 */
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification details' });
    }

    const crypto = require('crypto');
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
      
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('student', 'name email')
      .populate('room', 'roomNumber');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (payment.status !== 'Paid') {
      payment.status = 'Paid';
      payment.paidAt = new Date();
      payment.paymentMethod = 'Online';
      payment.transactionId = razorpay_payment_id;
      await payment.save();

      // Invalidate caches
      await redisClient.del('stats:payments');
      await redisClient.del('chart:revenue');

      // Generate PDF and email
      try {
        await generateAndEmailInvoice(payment);
      } catch (emailErr) {
        console.error('Invoice email failed:', emailErr);
      }
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Generate PDF Invoice and email to student
 */
async function generateAndEmailInvoice(payment) {
  const invoicesDir = path.join(__dirname, '..', 'invoices');
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

  const fileName = `invoice_${payment._id}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  // ── Generate PDF ──
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('StaySync', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#888').text('Smart Hostel Management System', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor('#6366f1').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Invoice title
    doc.fillColor('#000').fontSize(18).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown(1);

    // Details
    const leftX = 50;
    const rightX = 300;
    const details = [
      ['Receipt No:', `#${payment._id.toString().slice(-8).toUpperCase()}`],
      ['Date:', new Date(payment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
      ['Student:', payment.student?.name || 'N/A'],
      ['Email:', payment.student?.email || 'N/A'],
      ['Room:', payment.room?.roomNumber || 'N/A'],
      ['Month/Year:', `${payment.month}/${payment.year}`],
      ['Payment Method:', payment.paymentMethod],
      ['Transaction ID:', payment.transactionId || 'N/A'],
    ];

    doc.fontSize(11).font('Helvetica');
    details.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').fillColor('#333').text(label, leftX, doc.y, { continued: false });
      doc.font('Helvetica').fillColor('#555').text(value, rightX, doc.y - 14);
      doc.moveDown(0.4);
    });

    doc.moveDown(1);
    doc.strokeColor('#ddd').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Amount
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#6366f1').text(`Amount Paid: ₹${payment.amount.toLocaleString('en-IN')}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#22c55e').text('✓ PAID', { align: 'center' });

    doc.moveDown(3);
    doc.fontSize(8).fillColor('#aaa').text('This is a computer-generated receipt. No signature required.', { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // ── Send Email ──
  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured. Invoice saved to:', filePath);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"StaySync" <${process.env.SMTP_USER || 'noreply@staysync.com'}>`,
    to: payment.student?.email,
    subject: `Payment Receipt - Room ${payment.room?.roomNumber} (${payment.month}/${payment.year})`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;">
        <h2 style="color:#6366f1;">StaySync Payment Receipt</h2>
        <p>Hi <b>${payment.student?.name}</b>,</p>
        <p>Your payment of <b>₹${payment.amount.toLocaleString('en-IN')}</b> for Room ${payment.room?.roomNumber} (${payment.month}/${payment.year}) has been received successfully.</p>
        <p>Please find the PDF invoice attached.</p>
        <p style="color:#888;font-size:12px;">— StaySync Team</p>
      </div>
    `,
    attachments: [{ filename: fileName, path: filePath }],
  });

  console.log('Invoice emailed to:', payment.student?.email);
}

/**
 * @desc    Download invoice PDF
 * @route   GET /api/payments/:id/invoice
 */
exports.downloadInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'name email')
      .populate('room', 'roomNumber');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'Paid') return res.status(400).json({ success: false, message: 'Payment not yet completed' });

    // Check authorization
    if (req.user.role === 'student' && payment.student._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filePath = path.join(__dirname, '..', 'invoices', `invoice_${payment._id}.pdf`);

    // Generate if not exists
    if (!fs.existsSync(filePath)) {
      await generateAndEmailInvoice(payment);
    }

    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ success: false, message: 'Invoice file not found' });
    }
  } catch (err) {
    next(err);
  }
};
