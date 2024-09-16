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
  h3Index: {
    type: String,
    required: true
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
  },
  bookingStatus: {
    type: String,
    default: "Pending"
  },
  rideStatus: {
    type: String,
    default: "Not Started"
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