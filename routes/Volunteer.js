const express = require('express');
const router = express.Router();
const { signupVolunteer, verifyEmail, loginVolunteer, getUserDetails, updateUserProfile, verifyVehicle, fetchBookings, updateAvailability, updateStatus, updateLocation, updateBookingStatus, updateRideStatus, verifyAllocatedVolunteer, getCompletedRides } = require('../controllers/Volunteer');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Vas = require('../models/volunteers');

// POST route for volunteer signup
router.post('/signup', signupVolunteer);

// POST route for login
router.post('/login', (req, res) => {
    console.log('Login endpoint hit');
    loginVolunteer(req, res);
  });

// POST route for volunteer vehicle verification
router.post('/verify-vehicle', auth, verifyVehicle);  

// GET route to fetch volunteer user details
router.get('/user', auth, getUserDetails);

// POST route for volunteer email address verification
router.post('/verify-email', verifyEmail);

//PUT route to udpate volunteer details
router.put('/update-profile', auth, updateUserProfile);

// GET route to fetch volunteer's booking details
router.get('/locations/:emailId', fetchBookings);

// POST route to update volunteer's availability
router.post('/update-availability', auth, updateAvailability);

// POST route to update volunteer's status
router.post('/update-status', auth, updateStatus);

// POST route to update volunteer's location
router.post('/update-location', auth, updateLocation);

// POST route to update volunteer's booking status
router.post('/update-booking-status', auth, updateBookingStatus);

// POST route to update volunteer's ride status
router.post('/update-ride-status', auth, updateRideStatus);

// GET route to fetch allocated volunteer's details through email address
router.get('/verify-volunteer/:allocatedVolunteerEmail', verifyAllocatedVolunteer);

// Defining the directory path for file uploads by joining the current directory path (__dirname) 
// with a relative path '../uploads'
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setting up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize the multer middleware for handling file uploads.
// Limit the file size to 5MB 
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); 

// Function to handle profile picture upload
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const userId = req.user;
        const originalPath = req.file.path;
        const resizedPath = path.join(uploadDir, `${Date.now()}-resized-${req.file.filename}`);
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
        fs.unlinkSync(originalPath);
        const relativePath = `/uploads/${path.basename(resizedPath)}`;
        await Vas.findByIdAndUpdate(userId, { profilePicture: relativePath });
        res.status(200).json({ msg: 'Profile picture uploaded successfully', profilePicturePath: relativePath });
    } catch (error) {
        console.error('Error uploading profile picture:', error.message);
        res.status(500).json({ msg: 'Error uploading profile picture', error: error.message });
    }
};

// POST route to upload profile picture
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);

//GET route to fetch completed rides
router.get('/completed-rides', getCompletedRides);

module.exports = router;
