// Importing bcryptjs for password hashing
const bcrypt = require('bcryptjs'); 

// Importing mongoose to define the schema for Volunteers MongoDB collection
const mongoose = require('mongoose'); 

// Defining the schema for the Volunteers collection
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
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String, 
  },
  rating: {
    type: Number,
    default: 0.0
  },
  status: {
    type: Boolean,
    default: false
  },
  availability: {
    type: Boolean,
    default: false
  },
  latitude: {
    type: Number,
    default: 0
  },
  longitude: {
    type: Number,
    default: 0
  },
  h3Index: { //  The H3 geospatial index representing the Volunteer's location
    type: String,
    default: '0' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verificationCode: {
    type: String, 
    required: false
  }
});

module.exports = mongoose.model('Volunteers', vasSchema);
