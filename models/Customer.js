const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose');

// Define the schema for the Customer collection
const custSchema = new mongoose.Schema({
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
  phoneNumber: {
    type: String, 
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  homeAddress: {
    type: String
  },
  workAddress: {
    type: String
  },
  image: {
    data: Buffer,
    contentType: String 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Customer = mongoose.model('Customer', custSchema)

module.exports = Customer;
