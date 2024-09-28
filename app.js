require('dotenv').config();           // Loading environment variables from .env file into process.env
const express = require('express');   // Import the express library for Express application
const cors = require('cors');         // Importing the CORS library to handle cross-origin requests and prevent CORS issues
const connectDB = require('./db/connect'); // Import the connectDB function to connect to MongoDB
const path = require('path');         // Import the path module to handle file paths
const app = express();                // Create a new express application

const customerRoutes = require('./routes/Customer');
const volunteerRoutes = require('./routes/Volunteer');

const PORT = process.env.PORT || 8888; // Setting the port for the server to listen on

app.use(express.json()); // Middleware to parse JSON bodies of incoming requests

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to enable CORS (Cross-Origin Resource Sharing) for all routes
const corsOption = {
  origin: ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOption));
app.use('/api', volunteerRoutes);
app.use('/api', customerRoutes);

// Function to initialize the server and connect to database
const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

start();
