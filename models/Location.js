const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true, 
    min: -90, 
    max: 90   
  },
  longitude: {
    type: Number,
    required: true, 
    min: -180, 
    max: 180   
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  allocatedVolunteer: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now  
  },
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;