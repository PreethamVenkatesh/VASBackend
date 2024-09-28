const bcrypt = require('bcryptjs');
const axios = require('axios');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Vas = require('../models/volunteers'); 
const loc = require('../models/Location');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const h3 = require('h3-js');
const Location = require('../models/Location')

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Controller function to handle volunteer signup.
 * This function creates a new volunteer user .
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
    const verificationCode = generateVerificationCode();
    const newUser = new Vas({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      verificationCode
    });
    await sendVerificationEmail(emailId, verificationCode);
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
 * Controller function to send email OTP to volunteer.
 * This function allows the volunteer user to login with email and password.
 * 
 * @param {Object} emailId - The emailId request object
 * @param {Object} verificationCode - The verification code response object
 */
const sendVerificationEmail = async (emailId, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'vasliftassist@gmail.com', 
      pass: 'laeo pzft arha mrrq' 
    }
  });


const mailOptions = {
    from: 'vasliftassist@gmail.com',
    to: emailId,
    subject: 'Email Verification - VAS Lift Assist',
    text: `Your verification code is: ${verificationCode}`
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Controller function to handle volunteer email verification.
 * This function verifies the volunteer's email address.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const verifyEmail = async (req, res) => {
  const { emailId, verificationCode } = req.body;

  const user = await Vas.findOne({ emailId });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.verificationCode !== verificationCode) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  user.status = true; // Mark user as active
  user.verificationCode = null; // Clear the verification code
  await user.save();

  res.status(200).json({ message: 'Email verified successfully', user });
};

/**
 * Controller function to handle volunteer login.
 * This function allows the volunteer user to login with email and password.
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

/**
 * Controller function to fetch volunteer details.
 * This function get's the volunteer user's details.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
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

/**
 * Controller function to update volunteer details.
 * This function updates the volunteer user details.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
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

/**
 * Controller function to allocate volunteer.
 * This function allows the volunteer user to login with email and password.
 * 
 * @param {Object} customerId - The customer id request object
 * @param {Object} volunteerId - The volunteer id response object
 */
const allocateVolunteer = async (customerId, volunteerId) => {
  try {
    const customer = await Customer.findById(customerId);
    const volunteer = await Vas.findById(volunteerId);

    if (!customer || !volunteer) {
      throw new Error('Customer or Volunteer not found');
    }
    customer.allocatedVolunteer = volunteer._id;
    await customer.save();

    return { success: true };
  } catch (error) {
    console.error('Error allocating volunteer:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Controller function to handle volunteer vehicle verification.
 * This function verifies the vehicle plate number of volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
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

/**
 * Controller function to fetch volunteer bookings .
 * This function gets the bookings assigned to the volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const fetchBookings = async (req, res) => {
  console.log("First call")
  try {
    const { emailId } = req.params;
    console.log("Users emailId : " + emailId)
    const user = await Vas.findOne({ emailId });
    console.log(user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const locations = await loc.find({ allocatedVolunteer: user.emailId});
    if (!locations || locations.length === 0) {
      return res.status(404).json({ msg: 'No bookings found for this user' });
    }
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching locations', error: error.message });
  }
};

/**
 * Controller function to verify allocated volunteer.
 * This function verifies the allocated volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const verifyAllocatedVolunteer = async (req, res) => {
  try {
      const { allocatedVolunteerEmail } = req.params; 
      const volunteer = await Vas.findOne({ emailId: allocatedVolunteerEmail });
      
      if (!volunteer) {
          return res.status(404).json({ msg: 'Allocated volunteer not found' });
      }
      
      res.status(200).json(volunteer);
  } catch (error) {
      console.error('Error verifying allocated volunteer:', error.message);
      res.status(500).json({ msg: 'Error verifying allocated volunteer', error: error.message });
  }
};

/**
 * Controller function to update volunteer availability.
 * This function updates the availability of the volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateAvailability = async (req, res) => {
  try {
    const userId = req.user;  
    const { availability } = req.body;  
    const volunteer = await Vas.findById(userId);
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }
    volunteer.availability = availability;
    await volunteer.save();
    res.status(200).json({ msg: 'Availability updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating availability', error: error.message });
  }
};

/**
 * Controller function to update volunteer status.
 * This function updates the status of the volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateStatus = async (req, res) => {
  try {
    const userId = req.user;  
    const { status } = req.body; 
    const volunteer = await Vas.findById(userId);
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }
    volunteer.status = status;  
    await volunteer.save();

    res.status(200).json({ msg: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating status', error: error.message });
  }
};

/**
 * Controller function to update volunteer location.
 * This function updates the location of the volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateLocation = async (req, res) => {
  try {
    console.log('Update location request received:', req.body);

    const userId = req.user; 
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ msg: 'Latitude and Longitude are required' });
    }

    const user = await Vas.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newH3Index = h3.latLngToCell(latitude, longitude, 9);  // Generate H3 index based on latitude and longitude
    console.log(newH3Index);

    // Update user's location and H3 index
    user.latitude = latitude;
    user.longitude = longitude;
    user.h3Index = newH3Index;
    await user.save();

    console.log('User saved successfully with updated H3 index.');
    res.status(200).json({ msg: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error.message);
    res.status(500).json({ msg: 'Error updating location', error: error.message });
  }
};

/**
 * Controller function to update volunteer booking status.
 * This function updates the booking status of the volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    const booking = await loc.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    booking.bookingStatus = status;
    await booking.save();

    res.status(200).json({ msg: 'Booking status updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating booking status', error: error.message });
  }
};

/**
 * Controller function to update volunteer ride status.
 * This function updates the ride status of the volunteer user.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateRideStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    if (status !== 'Completed') {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    const booking = await loc.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    booking.rideStatus = status;
    await booking.save();
    res.status(200).json({ msg: 'Ride status updated to Completed successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating ride status', error: error.message });
  }
};

module.exports = { signupVolunteer, verifyEmail, loginVolunteer, getUserDetails, 
                    updateUserProfile, allocateVolunteer, verifyVehicle, fetchBookings, 
                      updateAvailability, updateStatus, updateLocation, updateBookingStatus, 
                        updateRideStatus, verifyAllocatedVolunteer };
