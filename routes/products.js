const express = require('express');
const router = express.Router();
const { signupVolunteer, loginVolunteer, getUserDetails } = require('../controllers/products');
const { customerSignUp } = require('../controllers/custregister');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Vas = require('../models/volunteers');
const sharp = require('sharp');

// POST route defined for the '/signup' endpoint, which uses the signupVolunteer function as its handler
router.post('/signup', signupVolunteer);
router.post('/custregister', customerSignUp);

// POST route defined for the '/login' endpoint, which uses the loginVolunteer function as its handler
router.post('/login', loginVolunteer);

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
        const originalPath = req.file.path; // Path of the uploaded file
        const resizedPath = path.join(uploadDir, `${Date.now()}-resized-${req.file.filename}`);
        
        // Resize the image using sharp
        await sharp(originalPath)
            .resize(500, 500, { // Resize to 500x500 or adjust as needed
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFile(resizedPath);

        // Remove the original file
        fs.unlinkSync(originalPath);

        // Save the relative path of the resized image in the database
        const relativePath = `/uploads/${path.basename(resizedPath)}`;
        await Vas.findByIdAndUpdate(userId, { profilePicture: relativePath });

        res.status(200).json({ msg: 'Profile picture uploaded successfully', profilePicturePath: relativePath });
    } catch (error) {
        console.error('Error uploading profile picture:', error.message);
        res.status(500).json({ msg: 'Error uploading profile picture', error: error.message });
    }
});

// Export the router object so it can be used in other parts of the application
module.exports = router;
