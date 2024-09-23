const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cust = require('../models/Customer'); // Import the Customer model
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const Location = require('../models/Location');
const FutureAssistSchema = require('../models/FutureBooking')
const h3 = require('h3-js')
const Vas = require('../models/volunteers'); 

/**
 * Controller function to handle customer signup.
 * This function creates a new customer user if the email does not already exist.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const customerSignUp = async (req, res) => {
  try {
    // Destructure the necessary fields from the request body
    const { firstName, lastName, emailId, phoneNumber, password } = req.body;

    // Check if all required fields are present
    if (!firstName || !lastName || !emailId || !phoneNumber || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Check if a user with the provided email already exists in the database
    const existingUser = await Cust.findOne({ emailId });
    if (existingUser) {
      // If user exists, respond with a 400 status and a message
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    console.log('Original Password:', password);

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Hashed Password:', hashedPassword);

    const custUser = new Cust({
      firstName,
      lastName,
      emailId,
      phoneNumber,
      password: hashedPassword
    });

    // Save the new user to the database
    await custUser.save();

    // Respond with a 201 status and a success message along with the new user data
    res.status(201).json({
      msg: 'User registered successfully',
      user: custUser
    });
  } catch (error) {
    // Log the error to the console for debugging purposes
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
    const { emailId, password } = req.body;

    const existingUser = await Cust.findOne({ emailId });
    if (!existingUser) {
      return res.status(404).json({ msg: 'User does not exist' });
    }

    // Check if the password matches
    // const isMatch = await bcrypt.compare(password, existingUser.password);
    if (password !== existingUser.password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a JWT token
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
 * Controller function to handle fetching customer details.
 * This function retrieves the details of the authenticated customer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */

const getUserDetails = async (req, res) => {
  const {emailId} = req.query;
  console.log(emailId)
  try {
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

const updateUser = async (req, res) => {
  const { emailId } = req.body;  // use req.body to fetch emailId and updated data from request body
  const { firstName, lastName, phoneNumber } = req.body;

  try {
    const updatedUser = await Cust.findOneAndUpdate(
      { emailId }, // Find the document by emailId
      { firstName, lastName, phoneNumber }, // Update the specified fields
      { new: true, runValidators: true } // Options: return the updated document and run validators
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLocation = async (req, res) => {
  try {
    const { custLocationLat, custLocationLong, date, time, destinationLat, destinationLong } = req.body;
    const h3Index = h3.latLngToCell(custLocationLat, custLocationLong, 9);
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
    });

    const savedLocation = await location.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    res.status(400).json({ message: 'Error saving location', error: error.message || error });
    console.error('Error saving location:', error);
  }
};

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
  await FutureAssist.save(); 
  res.status(201).json({ message: 'Booking confirmed' });
  } catch (error) {
    res.status(400).json({ message: 'Error saving booking', error });
  }
};

const findNearestVolunteer = async (custLatitude, custLongitude) => {
  try {
    const customerH3Index = h3.latLngToCell(custLatitude, custLongitude, 9);
    console.log(`Customer H3 Index: ${customerH3Index}`);
    let ringSize = 1;
    let nearestVolunteers = [];
    let closestVolunteer = null;
    let minDistance = Infinity;

    while (nearestVolunteers.length === 0 && ringSize <= 20) {
      const nearbyHexes = h3.gridDisk(customerH3Index, ringSize);
      console.log('Nearby hexagons:', nearbyHexes);
      console.log(`Searching with ring size: ${ringSize}`);
      nearestVolunteers = await Vas.find({
        h3Index: { $in: nearbyHexes },
        availability: true 
      });
      console.log(`Nearest volunteer: ${nearestVolunteers}`);
      let volunteerH3Index = null;
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

module.exports = { customerSignUp, customerLogin, getUserDetails,updateUser, createLocation, bookFutureRides, findNearestVolunteer };
