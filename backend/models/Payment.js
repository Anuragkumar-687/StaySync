const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Online', 'UPI', 'Bank Transfer'],
      default: 'Cash',
    },
    transactionId: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-set overdue status
PaymentSchema.pre('save', function (next) {
  if (this.status === 'Pending' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
