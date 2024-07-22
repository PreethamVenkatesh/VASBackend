const express = require('express');
const router = express.Router();
const { signupVolunteer } = require('../controllers/products'); // Import the signupVolunteer function from the products controller
const { customerSignUp } = require('../controllers/custregister');
const auth = require('../middleware/auth');

// POST route defined for the '/signup' endpoint, which uses the signupVolunteer function as its handler
router.post('/signup', signupVolunteer);
router.post('/custregister', customerSignUp);

// POST route defined for the '/login' endpoint, which uses the loginVolunteer function as its handler
router.post('/login', loginVolunteer);

router.get('/protected', auth, (req, res) => {
    res.json({ msg: 'This is a protected route' });
});

// Export the router object so it can be used in other parts of the application
module.exports = router;
