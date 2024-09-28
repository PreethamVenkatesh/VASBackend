const express = require('express');     // Import the express library
const router = express.Router();        // Create a new router object
const { customerSignUp, customerLogin, getUserDetails, updateUser, getLocations, createLocation, bookFutureRides, bookingConfirmation, getVolunteerLocation, updateRatingFeedback } = require('../controllers/CustSignup');     // Import the signupVolunteer function from the products controller

// POST route defined for the '/signup' endpoint, which uses the signupVolunteer function as its handler
router.post('/custregister', customerSignUp);

// POST route for customer login
router.post('/custlogin', customerLogin);

// GET route for customer details (protected)
router.get('/custdetails', getUserDetails);

// router.put('/custupdate:email',updateUser)
router.put('/custupdate', updateUser);

router.post('/userlocation', createLocation);

router.get('/userlocations', getLocations);

router.post('/futurelocation', bookFutureRides);

router.get('/booking-status/:customerEmailId', bookingConfirmation );

router.get('/volunteer-location/:email', getVolunteerLocation);

router.post('/booking/:bookingId/rating', updateRatingFeedback);

// Export the router object so it can be used in other parts of the application
module.exports = router;

