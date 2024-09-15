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

const allocateVolunteer = async (customerId, volunteerId) => {
  try {
    const customer = await Customer.findById(customerId);
    const volunteer = await Vas.findById(volunteerId);

    if (!customer || !volunteer) {
      throw new Error('Customer or Volunteer not found');
    }
    customer.allocatedVolunteer = volunteer._id;
    await customer.save();

    // volunteer.status = false;
    // await volunteer.save();

    return { success: true };
  } catch (error) {
    console.error('Error allocating volunteer:', error.message);
    return { success: false, error: error.message };
  }
};

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

const updateAvailability = async (req, res) => {
  try {
    const userId = req.user;  // Fetch the volunteer ID from the authenticated user
    const { availability } = req.body;  // Availability can be either true (available) or false (unavailable)

    // Find the volunteer by their ID
    const volunteer = await Vas.findById(userId);
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }

    // Update the availability status
    volunteer.availability = availability;
    await volunteer.save();

    // Respond with success message
    res.status(200).json({ msg: 'Availability updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating availability', error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const userId = req.user;  // Fetch the volunteer ID from the authenticated user
    const { status } = req.body;  // Status can be any string or boolean based on the app logic

    const volunteer = await Vas.findById(userId);
    if (!volunteer) {
      return res.status(404).json({ msg: 'Volunteer not found' });
    }

    volunteer.status = status;  // Update the status
    await volunteer.save();

    res.status(200).json({ msg: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error updating status', error: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    console.log('Update location request received:', req.body);

    const userId = req.user; // Fetch the volunteer ID from the authenticated user
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

const uploadProfilePicture = async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ msg: 'No file uploaded' });
      }

      const userId = req.user;
      const originalPath = req.file.path;
      const resizedPath = path.join(uploadDir, `${Date.now()}-resized-${req.file.filename}`);

      // Resize the image to 500x500
      await sharp(originalPath)
          .resize(500, 500, {
              fit: sharp.fit.inside,
              withoutEnlargement: true
          })
          .toFile(resizedPath);

      // Delete the original image file
      fs.unlinkSync(originalPath);

      // Create a relative path for storing in the database
      const relativePath = `/uploads/${path.basename(resizedPath)}`;

      // Update the user's profile picture in the database
      await Vas.findByIdAndUpdate(userId, { profilePicture: relativePath });

      res.status(200).json({ msg: 'Profile picture uploaded successfully', profilePicturePath: relativePath });
  } catch (error) {
      console.error('Error uploading profile picture:', error.message);
      res.status(500).json({ msg: 'Error uploading profile picture', error: error.message });
  }
};

module.exports = { signupVolunteer, loginVolunteer, getUserDetails, updateUserProfile, allocateVolunteer, verifyVehicle, fetchBookings, updateAvailability, updateStatus, updateLocation, updateBookingStatus, uploadProfilePicture };
