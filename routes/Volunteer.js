const express = require('express');
const router = express.Router();
const { signupVolunteer, loginVolunteer, getUserDetails, updateUserProfile, verifyVehicle } = require('../controllers/Volunteer');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Vas = require('../models/volunteers');
const sharp = require('sharp');
const h3 = require('h3-js');

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

// Route to handle profile picture upload
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const userId = req.user;
        const originalPath = req.file.path;
        const resizedPath = path.join(uploadDir, `${Date.now()}-resized-${req.file.filename}`);
        await sharp(originalPath)
            .resize(500, 500, { // Resize to 500x500
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFile(resizedPath);
        fs.unlinkSync(originalPath);
        const relativePath = `/uploads/${path.basename(resizedPath)}`;
        await Vas.findByIdAndUpdate(userId, { profilePicture: relativePath });

        res.status(200).json({ msg: 'Profile picture uploaded successfully', profilePicturePath: relativePath });
    } catch (error) {
        console.error('Error uploading profile picture:', error.message);
        res.status(500).json({ msg: 'Error uploading profile picture', error: error.message });
    }
});

router.post('/update-location', auth, async (req, res) => {
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

      const newH3Index = h3.latLngToCell(latitude, longitude, 9);
      console.log(newH3Index);
  
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
});

router.post('/update-status', auth, async (req, res) => {
    try {
      const userId = req.user;
      const { status } = req.body;
  
      const volunteer = await Vas.findById(userId);
      if (!volunteer) {
        return res.status(404).json({ msg: 'Volunteer not found' });
      }
  
      volunteer.status = status; // Update status
      await volunteer.save();
  
      res.status(200).json({ msg: 'Status updated successfully' });
    } catch (error) {
      res.status(500).json({ msg: 'Error updating status', error: error.message });
    }
  });

  router.post('/update-availability', auth, async (req, res) => {
    try {
      const userId = req.user;  // Fetch the volunteer ID from the authenticated user
      const { availability } = req.body;  // Availability can be either true (available) or false (unavailable)
  
      const volunteer = await Vas.findById(userId);
      if (!volunteer) {
        return res.status(404).json({ msg: 'Volunteer not found' });
      }
  
      volunteer.availability = availability;  // Update the availability status
      await volunteer.save();
  
      res.status(200).json({ msg: 'Availability updated successfully' });
    } catch (error) {
      res.status(500).json({ msg: 'Error updating availability', error: error.message });
    }
  });

module.exports = router;
