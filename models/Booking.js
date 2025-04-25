const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  campground: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campground',
    required: true
  },
  dateFrom: {
    type: Date,
    required: true
  },
  dateTo: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        // ห้ามเกิน 3 คืน
        const nights = (value - this.dateFrom) / (1000 * 60 * 60 * 24);
        return nights <= 3;
      },
      message: 'Booking cannot exceed 3 nights.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
