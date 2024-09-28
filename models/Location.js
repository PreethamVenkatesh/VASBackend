// Importing mongoose to define the schema for Location MongoDB collection
const mongoose = require('mongoose'); 

// Importing bcryptjs for password hashing
const bcrypt = require('bcryptjs');

// Defining the schema for the Location collection
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
  },
  customerEmailId: { 
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: "No feedback"
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;