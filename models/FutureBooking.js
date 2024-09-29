const mongoose = require('mongoose');

const FutureBookingSchema = new mongoose.Schema({
  fromLocation: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const FutureBooking = mongoose.model('FutureBooking', FutureBookingSchema);

module.exports = FutureBooking;
