const Cust = require('../models/Customer'); // Import the Customer model

/**
 * Controller function to handle customer signup.
 * This function creates a new customer user if the email does not already exist.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const customerSignUp = async (req, res) => {
  try {
    // Log the request headers and body
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);

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

    const custUser = new Cust({
      firstName,
      lastName,
      emailId,
      phoneNumber,
      password
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

module.exports = { customerSignUp };
