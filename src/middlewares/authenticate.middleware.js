import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.Models.js';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const Authenticate = async (req, res, next) => {

  // Check if JWT secret is set in .env file
  if (!ACCESS_SECRET) {
    return res.status(500).json({ msg: 'Server misconfiguration: JWT secret not set' });
  }

  // Retrieve token from cookies
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, ACCESS_SECRET);
    console.log('Decoded User email : ', decoded);

    // Attach decoded token info to request
    req.user = {
      _id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(409).json({ msg: 'Token expired!! Please regenerate access token!!' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Invalid token' });
    }
return res.status(401).json({ msg: 'Invalid token!!' });
  }
};

export default Authenticate;
