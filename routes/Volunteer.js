const express = require('express');
const router = express.Router();
const { signupVolunteer, verifyEmail, loginVolunteer, getUserDetails, updateUserProfile, verifyVehicle, fetchBookings, updateAvailability, updateStatus, updateLocation, updateBookingStatus, updateRideStatus, verifyAllocatedVolunteer } = require('../controllers/Volunteer');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Vas = require('../models/volunteers');

// POST route for signup
router.post('/signup', signupVolunteer);

// POST route for login
router.post('/login', (req, res) => {
    console.log('Login endpoint hit');
    loginVolunteer(req, res);
  });

// POST route for vehicle verification
router.post('/verify-vehicle', auth, verifyVehicle);  

// GET route for user details
router.get('/user', auth, getUserDetails);

router.post('/verify-email', verifyEmail);

router.put('/update-profile', auth, updateUserProfile);

router.get('/locations/:emailId', fetchBookings);

router.post('/update-availability', auth, updateAvailability);

router.post('/update-status', auth, updateStatus);

router.post('/update-location', auth, updateLocation);

router.post('/update-booking-status', auth, updateBookingStatus);

router.post('/update-ride-status', auth, updateRideStatus);

router.get('/verify-volunteer/:allocatedVolunteerEmail', verifyAllocatedVolunteer);

// GET route for protected resource
router.get('/protected', auth, (req, res) => {
    res.json({ msg: 'This is a protected route' });
});

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Profile picture upload handler
const uploadProfilePicture = async (req, res) => {
    try {
        // Check if a file is uploaded
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        // Log userId and file information for debugging
        console.log('User ID:', req.user);  // Ensure userId is being passed correctly
        console.log('Uploaded file:', req.file);

        const userId = req.user;
        const originalPath = req.file.path;
        const resizedPath = path.join(uploadDir, `${Date.now()}-resized-${req.file.filename}`);

        // Resize the image to 500x500 using sharp
        try {
            await sharp(originalPath)
                .resize(500, 500, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: true
                })
                .toFile(resizedPath);
        } catch (sharpError) {
            console.error('Error resizing image:', sharpError.message);
            return res.status(500).json({ msg: 'Error resizing image', error: sharpError.message });
        }

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

// Route for uploading profile picture
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
