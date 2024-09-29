// Importing mongoose to define the schema for Location MongoDB collection
const mongoose = require('mongoose'); 

// Importing bcryptjs for password hashing
const bcrypt = require('bcryptjs');

// Defining the schema for the Location collection
const locationSchema = new mongoose.Schema({
  custLocationLat: { // latitude of the customer location
    type: Number,
    required: true, 
    min: -90, 
    max: 90   
  },
  custLocationLong: { //longitude of the customer location
    type: Number,
    required: true, 
    min: -180, 
    max: 180   
  },
  h3Index: { //  The H3 geospatial index representing the customer's location
    type: String,
    required: true
  },
  date: {  // the date of booking
    type: Date,
    required: true
  },
  time: { // the time of booking
    type: String,
    required: true
  },
  allocatedVolunteer: { // The email ID of the volunteer allocated to this location
    type: String,
  },
  bookingStatus: { // The status of the booking
    type: String,
    default: "Pending"
  },
  rideStatus: { // The ride status
    type: String,
    default: "Not Started"
  },
  createdAt: {  // Automatically sets the creation timestamp when the record is created
    type: Date,
    default: Date.now  
  },
  destinationLat: { // Latitude of the destination where the customer wants to going
    type: Number,
    required: true, 
    min: -90, 
    max: 90   
  },
  destinationLong: {  // Logitude of the destination where the customer wants to going
    type: Number,
    required: true, 
    min: -180, 
    max: 180   
  },
  customerEmailId: {  // The email ID of the customer associated with the booking
    type: String,
    default: null
  },
  rating: { // The rating provided by the customer for the ride
    type: Number,
    default: 0
  },
  feedback: { // Customer feedback about the ride
    type: String,
    default: "No feedback"
  }
});

// Creating a model from the schema that represents the 'FutureBooking' collection in MongoDB
const Location = mongoose.model('Location', locationSchema);

// Exporting the FutureBooking model to be used in other parts
module.exports = Location;