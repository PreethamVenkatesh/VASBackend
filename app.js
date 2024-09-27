require('dotenv').config();           // Load environment variables from a .env file into process.env
const express = require('express');   // Import the express library
const cors = require('cors');         // Import the CORS library to handle cross-origin requests
const connectDB = require('./db/connect'); // Import the connectDB function from the db/connect module
const Volunteer = require('./models/volunteers');
const Location = require('./models/Location');
const Customer = require('./models/Customer');
const path = require('path');         // Import the path module to handle file paths
const app = express();                // Create a new express application
const customerRoutes = require('./routes/Customer');
const volunteerRoutes = require('./routes/Volunteer');

// Set the port for the server to listen on
const PORT = process.env.PORT || 8888;

// Middleware to parse JSON bodies of incoming requests
app.use(express.json());

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
