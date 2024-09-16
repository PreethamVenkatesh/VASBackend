const express = require('express');
const router = express.Router();
const { signupVolunteer, loginVolunteer, getUserDetails, updateUserProfile, verifyVehicle, fetchBookings, updateAvailability, updateStatus, updateLocation, updateBookingStatus, updateRideStatus, uploadProfilePicture } = require('../controllers/Volunteer');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


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

router.put('/update-profile', auth, updateUserProfile);

router.get('/locations/:emailId', fetchBookings);

router.post('/update-availability', auth, updateAvailability);

router.post('/update-status', auth, updateStatus);

router.post('/update-location', auth, updateLocation);

router.post('/update-booking-status', auth, updateBookingStatus);

router.post('/update-ride-status', auth, updateRideStatus);

// GET route for protected resource
router.get('/protected', auth, (req, res) => {
    res.json({ msg: 'This is a protected route' });
});

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload-profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
