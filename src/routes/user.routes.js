import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile (protected route)
router.get('/profile', authMiddleware, getUserProfile);

export default router;
