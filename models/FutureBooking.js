const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose');

// Define the schema for the Customer collection
const FutureAssistSchema = new mongoose.Schema({
    fromLocation: String,
    destination: String,
    date: String,
    time: String,
    });
const FutureBooking = mongoose.model('FutureBooking', FutureAssistSchema)

module.exports = FutureBooking;
