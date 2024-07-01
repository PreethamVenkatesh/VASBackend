const express = require('express');     // Import the express library
const router = express.Router();        // Create a new router object
const { signupVolunteer } = require('../controllers/products');     // Import the signupVolunteer function from the products controller

// POST route defined for the '/signup' endpoint, which uses the signupVolunteer function as its handler
router.post('/signup', signupVolunteer);

// Export the router object so it can be used in other parts of the application
module.exports = router;
