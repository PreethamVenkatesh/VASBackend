const express = require('express');
const router = express.Router();
const { signupVolunteer } = require('../controllers/products'); // Import the signupVolunteer function from the products controller
const { customerSignUp } = require('../controllers/custregister');

// POST route defined for the '/signup' endpoint, which uses the signupVolunteer function as its handler
router.post('/signup', signupVolunteer);
router.post('/custregister', customerSignUp);

// Export the router object so it can be used in other parts of the application
module.exports = router;
