const express = require('express');     // Import the express library to create a new router for handling HTTP requests
const router = express.Router();        // Create a new router object
 // Importing functions from the 'CustSignup' controller file
const { 
    customerSignUp, 
    customerLogin, 
    getUserDetails, 
    updateUser, 
    getLocations, 
    createLocation, 
    bookFutureRides, 
    getFutureBookings, 
    bookingConfirmation, 
    getVolunteerLocation, 
    updateRatingFeedback } = require('../controllers/CustSignup');    

// POST route for customer registration 
router.post('/custregister', customerSignUp);

// POST route for customer login
router.post('/custlogin', customerLogin);

// GET route for fetching customer details
router.get('/custdetails', getUserDetails);

// PUT route for updating customer details
router.put('/custupdate', updateUser);

// POST route for submitting customer location 
router.post('/userlocation', createLocation);

// GET route for fetching customer locations
router.get('/userlocations', getLocations);

// POST route for booking a future ride
router.post('/futurelocation', bookFutureRides);

// GET route for fetching future ride bookings
router.get('/futurebookings', getFutureBookings);

// GET route for fetching booking confirmation
router.get('/booking-status/:customerEmailId', bookingConfirmation );

// GET route for fetching the volunteer's location
router.get('/volunteer-location/:email', getVolunteerLocation);

// POST route for submitting a rating and feedback for a booking
router.post('/booking/:bookingId/rating', updateRatingFeedback);

// Export the router to be used in the main application file
module.exports = router;

