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

// Set the port for the server to listen on
const PORT = process.env.PORT || 8888;

// Middleware to parse JSON bodies of incoming requests
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to enable CORS (Cross-Origin Resource Sharing) for all routes
const corsOption = {
  origin: ["http://localhost:3000"],
  // origin: ["https://my-json-server.typicode.com/santoshlearner07/users_api"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));


app.use('/api', Volunteer);
app.use('/api', customerRoutes);

app.get('/locations/:firstName', async (req, res) => {
  try {
    const { firstName } = req.params;

    // Find user by first name
    const user = await Volunteer.findOne({ firstName });
    console.log(user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Fetch locations for the found user
    const locations = await Location.find({ allocatedVolunteer: user.firstName });
    console.log(locations)
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching locations', error: error.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    // console.log(req.body)
    const user = await Customer.create(req.body);
    // console.log(user)
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

app.post("/test", (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

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
