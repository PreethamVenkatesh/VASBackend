const mongoose = require('mongoose'); // Importing mongoose to define a schema for MongoDB

// Defining the schema for the 'FutureBooking' collection in MongoDB
const FutureBookingSchema = new mongoose.Schema({
  fromLocation: { // The start location of the customer
    type: String,
    required: true,
  },
  destination: { // The destination where the customer wants to go
    type: String,
    required: true,
  },
  date: { // The date for the future booking
    type: Date,
    required: true,
  },
  time: { // The time of the booking
    type: String,
    required: true,
  },
}, { timestamps: true });

// Creating a model from the schema that represents the 'FutureBooking' collection in MongoDB
const FutureBooking = mongoose.model('FutureBooking', FutureBookingSchema);

// Exporting the FutureBooking model to be used in other places
module.exports = FutureBooking;
