const Vas = require('../models/volunteers'); // Import the Vas model from the product file

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

    // Create a new user instance with the provided details
    const newUser = new Vas({
      firstName,
      lastName,
      emailId,
      vehicleNumber,
      brpNumber,
      password
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
    console.error('Error creating user:', error);
    res.status(500).json({ msg: 'Error creating user', error });
  }
};

module.exports = { signupVolunteer }; // Export the signupVolunteer function for use in routes
