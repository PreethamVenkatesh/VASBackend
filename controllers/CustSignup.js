const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cust = require('../models/Customer'); // Import the Customer model
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

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

    // Check if the user exists in the database
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

module.exports = { customerSignUp, customerLogin, getUserDetails };
