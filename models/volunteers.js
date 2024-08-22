const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose'); // Import the mongoose library

// Define the schema for the VAS collection
const vasSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String, 
  },
  volunteer: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the VAS model based on the vasSchema
module.exports = mongoose.model('Volunteers', vasSchema);
