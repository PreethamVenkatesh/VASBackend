const bcrypt = require('bcryptjs'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for creating and verifying JSON Web Tokens (JWT)
const Cust = require('../models/Customer'); // Import the Customer model
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Secret key for JWT signing, fallback to hardcoded value
const Location = require('../models/Location');
const FutureAssistSchema = require('../models/FutureBooking')
const h3 = require('h3-js') // Import H3 library for geospatial indexing
const Vas = require('../models/volunteers'); 

/**
 * Controller function to handle customer signup.
 * This function creates a new customer user if the email does not already exist.
 * 
 * @param {Object} req - The request object containing user data
 * @param {Object} res - The response object
 */
const customerSignUp = async (req, res) => {
  try {
    // Extract data from the request body
    const { firstName, lastName, emailId, phoneNumber, password } = req.body;
    if (!firstName || !lastName || !emailId || !phoneNumber || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    // Check if the user already exists based on email
    const existingUser = await Cust.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);

     // Create a new customer object
    const custUser = new Cust({
      firstName,
      lastName,
      emailId,
      phoneNumber,
      password: hashedPassword
    });

    // Save the new user to the database
    await custUser.save();
    res.status(201).json({
      msg: 'User registered successfully',
      user: custUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ msg: 'Error creating user', error });
  }
};

/**
 * Controller function to handle customer login.
 * This function checks the email and password for an existing customer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const customerLogin = async (req, res) => {
  try {
    // Extract email and password from request body
    const { emailId, password } = req.body;

    // Check if the user exists
    const existingUser = await Cust.findOne({ emailId });
    if (!existingUser) {
      return res.status(404).json({ msg: 'User does not exist' });
    }

    // Compare input password with the stored hashed password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a JWT token valid for 1 hour
    const token = jwt.sign({ userId: existingUser._id,emailId:existingUser.emailId}, JWT_SECRET, { expiresIn: '1h' });
    console.log(token)
    res.status(200).json({
      msg: 'User logged in successfully',
      token
    });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).json({ msg: 'Error logging in user', error: error.message });
  }
};

/**
 * Fetch customer details based on email.
 * 
 * @param {Object} req - Request object with email query
 * @param {Object} res - Response object to send user data
 */

const getUserDetails = async (req, res) => {
  const {emailId} = req.query;
  console.log(emailId)
  try {
    // Find user by email
    const user = await Cust.findOne({emailId});
    console.log(user)
    if (!user) {
        res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ msg: 'Error fetching user details', error: error.message });
  }
};

/**
 * Update customer details.
 * 
 * @param {Object} req - Request object containing updated user data
 * @param {Object} res - Response object to return updated data or errors
 */
const updateUser = async (req, res) => {
  const { emailId } = req.body;  // Get emailId to identify the user
  const { firstName, lastName, phoneNumber } = req.body; // Extract new details to update

  try {
    // Find the user by emailId and update the details
    const updatedUser = await Cust.findOneAndUpdate(
      { emailId }, 
      { firstName, lastName, phoneNumber }, 
      { new: true, runValidators: true } 
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    // Return the updated user details
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Save customer location and find the nearest available volunteer using H3 geospatial indexing.
 * 
 * @param {Object} req - Request object with location data
 * @param {Object} res - Response object to send back success or error message
 */
const createLocation = async (req, res) => {
  try {
    const { custLocationLat, custLocationLong, date, time, destinationLat, destinationLong,customerEmailId } = req.body;
    
    // Get the H3 geospatial index for the customer location
    const h3Index = h3.latLngToCell(custLocationLat, custLocationLong, 9);

    // Find the nearest volunteer to the customer 
    const nearestVolunteer = await findNearestVolunteer(custLocationLat, custLocationLong);

    if (!nearestVolunteer) {
      return res.status(404).json({ msg: 'No volunteers found nearby' });
    }

    const location = new Location({
      custLocationLat,
      custLocationLong,
      h3Index,
      date,
      time,
      allocatedVolunteer: nearestVolunteer.emailId,
      destinationLat, 
      destinationLong,
      customerEmailId
    });

    const savedLocation = await location.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    res.status(400).json({ message: 'Error saving location', error: error.message || error });
    console.error('Error saving location:', error);
  }
};

/**
 * Fetch customer locations. If an emailId is provided, filter by allocated volunteer.
 * 
 * @param {Object} req - Request object with query params
 * @param {Object} res - Response object to send locations data
 */
const getLocations = async (req, res) => {
  try {
    const { emailId } = req.query; 

    const query = {};
    if (emailId) {
      query.allocatedVolunteer = emailId;  // Filter locations by allocated volunteer's email
    }

    const locations = await Location.find(query);

    if (!locations || locations.length === 0) {
      return res.status(404).json({ msg: 'No locations found' });
    }

    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching locations', error: error.message });
  }
};

/**
 * Book a future ride by saving the ride details in the database.
 * 
 * @param {Object} req - Request object with future ride data
 * @param {Object} res - Response object confirming the booking
 */
const bookFutureRides = async (req, res) => {
  try {
    const { fromLocation, destination, date, time } = req.body;
  console.log('Future booking received:', {
    fromLocation,
    destination,
    date,
    time,
  });
  const FutureAssist = new FutureAssistSchema({ fromLocation, destination, date, time });
  
  // Save the future booking
  await FutureAssist.save(); 
  res.status(201).json({ message: 'Booking confirmed' });
  } catch (error) {
    res.status(400).json({ message: 'Error saving booking', error });
  }
};

/**
 * Fetch all future bookings.
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object to send back future bookings
 */
const getFutureBookings = async (req, res) => {
  try {
    const futureBookings = await FutureAssistSchema.find();
    if (!futureBookings || futureBookings.length === 0) {
      return res.status(404).json({ msg: 'No future bookings found' });
    }
    res.status(200).json(futureBookings);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching future bookings', error: error.message });
  }
};

/**
 * Find the nearest volunteer to the customer using H3 geospatial indexing.
 * 
 * @param {Number} custLatitude - Customer's latitude
 * @param {Number} custLongitude - Customer's longitude
 * @returns {Object|null} - Nearest volunteer object or null if not found
 */
const findNearestVolunteer = async (custLatitude, custLongitude) => {
  try {
    const customerH3Index = h3.latLngToCell(custLatitude, custLongitude, 9);
    console.log(`Customer H3 Index: ${customerH3Index}`);
    let ringSize = 1;
    let nearestVolunteers = [];
    let closestVolunteer = null;
    let minDistance = Infinity;

    // Search volunteers in rings of increasing distance
    while (nearestVolunteers.length === 0 && ringSize <= 20) {
      const nearbyHexes = h3.gridDisk(customerH3Index, ringSize);
      console.log('Nearby hexagons:', nearbyHexes);
      console.log(`Searching with ring size: ${ringSize}`);
      nearestVolunteers = await Vas.find({
        h3Index: { $in: nearbyHexes },
        availability: true // Filter only available volunteers
      });
      console.log(`Nearest volunteer: ${nearestVolunteers}`);
      let volunteerH3Index = null;

      // Calculate distances to find the closest volunteer
      for (let volunteer of nearestVolunteers) {
        volunteerH3Index = h3.latLngToCell(volunteer.latitude, volunteer.longitude, 9);
        const h3Distance = h3.gridDistance(customerH3Index, volunteerH3Index);
        console.log(`H3 Distance between customer and volunteer: ${h3Distance}`);

        if (h3Distance < minDistance) {
          minDistance = h3Distance;
          closestVolunteer = volunteer;
          console.log(`Closest volunteer: ${closestVolunteer}`);
        }
      }
      ringSize++;
    }
    return closestVolunteer;
  } catch (error) {
    console.error('Error finding nearest volunteer:', error.message);
    throw new Error('Error finding nearest volunteer');
  }
};

/**
 * Confirm the booking status for a customer based on their email.
 * 
 * @param {Object} req - Request object with customer email
 * @param {Object} res - Response object returning the latest booking
 */
const bookingConfirmation = async (req, res) => {
  try {
    const { customerEmailId } = req.params;

    // Find the latest booking for the customer
    const booking = await Location.findOne({ customerEmailId }).sort({ createdAt: -1 });

    if (!booking) {
      return res.status(404).json({ message: 'No booking found for this customer.' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Fetch volunteer location based on email ID.
 * 
 * @param {Object} req - Request object with volunteer email
 * @param {Object} res - Response object returning volunteer's location
 */
const getVolunteerLocation = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("EmailId : " + email)
    const volunteer = await Vas.findOne({ emailId: email }); 
    console.log("Volunteer : " + volunteer)

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Return latitude and longitude of the volunteer
    res.json({
      lat: volunteer.latitude,  
      lng: volunteer.longitude,
    });
  } catch (error) {
    console.error('Error fetching volunteer location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update rating and feedback for a booking.
 * 
 * @param {Object} req - Request object containing bookingId and feedback details
 * @param {Object} res - Response object confirming update
 */
const updateRatingFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params; // Get the booking ID 
    const { rating, feedback } = req.body; // Get the ratings and feedback 

    // Find the booking by its ID and update ratings and feedback
    const updatedBooking = await Location.findByIdAndUpdate(
      bookingId,
      { rating, feedback },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Rating and feedback updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating rating and feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Export all controller functions for use in other parts of the application
module.exports = { customerSignUp, customerLogin, getUserDetails,updateUser, createLocation, getLocations, bookFutureRides, getFutureBookings, findNearestVolunteer, bookingConfirmation, getVolunteerLocation, updateRatingFeedback };
