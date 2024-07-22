const mongoose = require('mongoose'); // Import the mongoose library

const custSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: true
  },
  lastName: {
    type: String,
    // required: true
  },
  emailId: {
    type: String,
    // required: true,
    // unique: true
  },
  phoneNumber: {
    type: String, // Changed from Number to String to handle leading zeros
    // required: true,
    // unique: true
  },
  password: {
    type: String,
    // required: true
  },
  // createdAt: {
    // type: Date,
    // // default: Date.now
  // }
});
const Customer = mongoose.model('Customer', custSchema)

module.exports = Customer;
// module.exports = mongoose.model('Customer', custSchema);
