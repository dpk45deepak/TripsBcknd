import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.models.js';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization || req.cookies?.accessToken;
  console.log('Authorization Header:', authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }
  // trim to avoid trailing-space issues
  const token = authHeader.split(' ')[1]?.trim();

  if (!ACCESS_SECRET) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT secret not set' });
  }

  const decoded = jwt.verify(token, ACCESS_SECRET);
  console.log('Decoded JWT:', decoded);

  try {
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
