require('dotenv').config();           // Load environment variables from a .env file into process.env
const express = require('express');   // Import the express library
const cors = require('cors');         // Import the CORS library to handle cross-origin requests
const app = express();                // Create a new express application
const connectDB = require('./db/connect');              // Import the connectDB function from the db/connect module
const productsRoutes = require('./routes/products');    // Import the productsRoutes from the routes/products module
// Set the port for the server to listen on
const PORT = process.env.PORT || 8888;          
// Middleware to parse JSON bodies of incoming requests
app.use(express.json());
// Middleware to enable CORS (Cross-Origin Resource Sharing) for all routes
app.use(cors());

app.use('/api', productsRoutes);

const start = async () => {
  try {
    // Attempt to connect to the MongoDB database using the connection string from environment variables
    await connectDB(process.env.MONGODB_URL);
    app.listen(PORT, () => {
      // Start the server and log the URL it's running on
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Log any errors that occur while starting the server
    console.error('Error starting server:', error);
  }
};
// Call the start function to initialize the database connection and start the server
start();
