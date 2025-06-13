import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.models.js';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
