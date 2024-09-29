const bcrypt = require('bcryptjs'); // Importing bcryptjs for password hashing

// Importing mongoose to define the schema for Customer MongoDB collection
const mongoose = require('mongoose');

// Defining the schema for the Customer details collection
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

// Creating a model from the schema that represents the 'Customer' collection in MongoD
const Customer = mongoose.model('Customer', custSchema)

// Exporting the Customer model to be used in other places
module.exports = Customer;
