const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose'); 

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
  h3Index: {
    type: String,
    default: '0' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Volunteers', vasSchema);
