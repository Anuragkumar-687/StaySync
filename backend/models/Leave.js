const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required'],
    },
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    qrToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrScannedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Validate return date is after departure
LeaveSchema.pre('validate', function (next) {
  if (this.returnDate && this.departureDate && this.returnDate <= this.departureDate) {
    this.invalidate('returnDate', 'Return date must be after departure date');
  }
  next();
});

module.exports = mongoose.model('Leave', LeaveSchema);
