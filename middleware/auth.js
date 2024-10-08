const jwt = require('jsonwebtoken');

// Defining a secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware function for authentication
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;