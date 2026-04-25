const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
    },
    type: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      default: 'Single',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    occupied: {
      type: Number,
      default: 0,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rent: {
      type: Number,
      required: [true, 'Rent amount is required'],
      min: [0, 'Rent cannot be negative'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Full', 'Maintenance'],
      default: 'Available',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Update status based on capacity
RoomSchema.pre('save', function (next) {
  if (this.occupied === 0) this.status = 'Available';
  else if (this.occupied >= this.capacity) this.status = 'Full';
  else this.status = 'Occupied';
  next();
});

module.exports = mongoose.model('Room', RoomSchema);
