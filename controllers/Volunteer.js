const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Vas = require('../models/volunteers'); 
const loc = require('../models/Location');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * Controller function to handle volunteer signup.
 * This function creates a new volunteer user if the email does not already exist.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const signupVolunteer = async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    const existingUser = await Vas.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Vas({
      firstName,
      lastName,
      emailId,
      password: hashedPassword 
    });
    await newUser.save();
    res.status(201).json({
      msg: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ msg: 'Error creating user', error: error.message });
  }
};

/**
 * Controller function to handle volunteer login.
 * This function checks the email and password for an existing volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const loginVolunteer = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const existingUser = await Vas.findOne({ emailId });
    if (!existingUser) {
      return res.status(404).json({ msg: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      msg: 'User logged in successfully',
      token
    });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).json({ msg: 'Error logging in user', error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userId = req.user;
    const user = await Vas.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ msg: 'Error fetching user details', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user;
    const { firstName, lastName, emailId} = req.body;

    const user = await Vas.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (emailId && emailId !== user.emailId) {
      const existingUser = await Vas.findOne({ emailId: emailId });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email is already in use' });
      }
      user.emailId = emailId;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    await user.save();

    res.status(200).json({ msg: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ msg: 'Error updating user profile', error: error.message });
  }
};

const handleLocation = async (req, res) => {
  try {
    const { custLocationLat, custLocationLong, allocatedVolunteer, date, time, destinationLat, destinationLong } = req.body;

    if (custLocationLat < -90 || custLocationLat > 90 || custLocationLong < -180 || custLocationLong > 180) {
      return res.status(400).json({ msg: 'Invalid customer latitude or customer longitude' });
    }

    if (destinationLat < -90 || destinationLat > 90 || destinationLong < -180 || destinationLong > 180) {
      return res.status(400).json({ msg: 'Invalid destination latitude or destination longitude' });
    }

    const newLocation = new loc({ custLocationLat, custLocationLong, allocatedVolunteer, date, time, destinationLat, destinationLong });
    await newLocation.save();

    res.status(201).json({ msg: 'Ride saved successfully', location: newLocation });
  } catch (error) {
    res.status(500).json({ msg: 'Error saving ride', error: error.message });
  }
}

const userLocation = async (req, res) => {
  try {
    const { firstName } = req.params;

    // Find user by first name
    const user = await Vas.findOne({ firstName });
    console.log(user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Fetch locations for the found user
    const locations = await loc.find({ allocatedVolunteer: user.firstName });
    console.log(locations)
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching locations', error: error.message });
  }
}

const verifyVehicle = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const { registrationNumber } = req.body;
    if (!registrationNumber || typeof registrationNumber !== 'string') {
      return res.status(400).json({ msg: 'Invalid registration number' });
    }
    const userId = req.user;
    const apiKey = 'lRNIKen41B4vIKQygtbdY6CYml48oeoZ8sXbpt0M';
    const response = await axios.post(
      'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
      { registrationNumber },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200 && response.data) {
      const updatedUser = await Vas.findByIdAndUpdate(
        userId,
        { status: true },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ msg: 'User not found' });
      }

      res.status(200).json({ user: updatedUser, vehicleData: response.data });
    } else {
      res.status(500).json({ msg: 'Vehicle verification API error', data: response.data });
    }
  } catch (error) {
    console.error('Error verifying vehicle:', error.message);
    res.status(500).json({ msg: 'Error verifying vehicle', error: error.message });
  }
};

module.exports = { signupVolunteer, loginVolunteer, getUserDetails, updateUserProfile, handleLocation, verifyVehicle };
