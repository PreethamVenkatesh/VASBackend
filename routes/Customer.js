const express = require('express');     // Import the express library
const router = express.Router();        // Create a new router object
const { customerSignUp, customerLogin, getCustomerDetails } = require('../controllers/CustSignup');     // Import the signupVolunteer function from the products controller

// POST route defined for the '/signup' endpoint, which uses the signupVolunteer function as its handler
router.post('/custregister', customerSignUp);

// POST route for customer login
router.post('/custlogin', customerLogin);

// GET route for customer details (protected)
router.get('/custdetails', getCustomerDetails);

// Export the router object so it can be used in other parts of the application
module.exports = router;
