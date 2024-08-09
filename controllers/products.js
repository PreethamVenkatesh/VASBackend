const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vas = require('../models/volunteers'); 
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
    // Destructure the necessary fields from the request body
    const { firstName, lastName, emailId, vehicleNumber, brpNumber, password } = req.body;

    // Check if a user with the provided email already exists in the database
    const existingUser = await Vas.findOne({ emailId });
    if (existingUser) {
      // If user exists, respond with a 400 status and a message
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance with the provided details
    const newUser = new Vas({
      firstName,
      lastName,
      emailId,
      vehicleNumber,
      brpNumber,
      password: hashedPassword 
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with a 201 status and a success message along with the new user data
    res.status(201).json({
      msg: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    // Log the error to the console for debugging purposes
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

module.exports = { signupVolunteer, loginVolunteer, getUserDetails };
