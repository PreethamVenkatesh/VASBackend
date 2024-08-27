const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const locationSchema = new mongoose.Schema({
  custLocationLat: {
    type: Number,
    required: true, 
    min: -90, 
    max: 90   
  },
  custLocationLong: {
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
  destinationLat: {
    type: Number,
    required: true, 
    min: -90, 
    max: 90   
  },
  destinationLong: {
    type: Number,
    required: true, 
    min: -180, 
    max: 180   
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;