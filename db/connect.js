const mongoose = require('mongoose'); // Import the mongoose library

/**
 * Function to connect to the MongoDB database.
 * 
 * @param {string} uri - The connection string/URI for MongoDB
 */
const connectDB = async (uri) => {
  try {
    console.log('Connecting to DB...'); // Log the initial connection attempt
    await mongoose.connect(uri); // Attempt to connect to the database using the provided URI
  console.log('MongoDB connected successfully'); // Log success message upon successful connection
  } catch (error) {
    console.error('MongoDB connection error:', error); // Log error message if connection fails
    throw error; 
  }
};

module.exports = connectDB; // Export the connectDB function for use in other parts of the application
