// HYBRID JWT AUTH (ACCESS + REFRESH TOKEN STORED IN DB)
import User from '../models/UserModels.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import generateTokens from "../utils/generateTokens.js";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured');
}


export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Input validation
        switch (true) {
            case !email:
                return res.status(400).json({ msg: 'Email is required' });
            case !password:
                return res.status(400).json({ msg: 'Password is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ msg: 'User already exists' });
        }

        // Create new user
        const newUser = new User({
            email,
            password,
            role: 'user',
            tokens: []
        });

        const tokens = generateTokens(newUser);
        newUser.tokens = [{ refreshToken: tokens.refreshToken }]; // Replace entire tokens array with single new token

        await newUser.save();
        console.log(`New user registered with email: ${newUser.email}`); // Debugging line

        // Set both tokens in cookies
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 45 * 24 * 60 * 60 * 1000, // 45 days
        });

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return res.status(201).json({
            msg: 'User registered successfully!!',
            alertMsg: "Confirm your email address to unlock all features!",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            }
        });
    } catch (error) {
        console.error('Registration Controller error:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔹 Input validation
        if (!email) return res.status(400).json({ msg: 'Email is required' });
        if (!password) return res.status(400).json({ msg: 'Password is required' });

        // 🔹 Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: 441, msg: 'User not found, invalid credentials' });
        }

        // 🔹 Check if user registered via Google OAuth
        if (!user.password) {
            return res.status(400).json({ msg: "Use Google to login" });
        }


        // 🔹 Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 441, msg: 'Invalid credentials' });
        }

        console.log(`🟢 User "${user.username}" with email "${user.email}" logged in.`);

        // 🔹 Generate tokens
        const tokens = generateTokens(user);

        // Store refresh token in DB (replace old tokens)
        user.tokens = [{ refreshToken: tokens.refreshToken }];
        await user.save();

        // 🔹 Set cookies
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 45 * 24 * 60 * 60 * 1000, // 45 days
        });

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        // 🔹 Send success response
        return res.status(200).json({
            msg: 'Login completed successfully!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Login error:', error.message);

        if (error.message.toString() === 'data and hash arguments required') {
            return res.status(501).json({ msg: 'Use Google to login.' });
        }

        return res.status(500).json({ msg: 'Internal server error' });
    }
};


export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ msg: "No refresh token provided" });

        // Check refresh token in DB
        // Verify refresh token by checking its decoded user in DB.
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = await User.findOne({ _id: decoded.userId, email: decoded.email });
        if (!user) return res.status(403).json({ msg: "User not found with this refresh token, Invalid refresh token" });

        // Generate new access token
        const newTokens = generateTokens(user);
        // Update refresh token in DB
        user.tokens = [{ refreshToken: newTokens.refreshToken }]; // Store as array with single token object
        await user.save();

        // Set both tokens in cookies
        res.cookie("refreshToken", newTokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 45 * 24 * 60 * 60 * 1000, // 45 days
        });

        res.cookie("accessToken", newTokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return res
                .status(200)
                .json({
                    msg: "Access token refreshed successfully",
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    }
                });
    } catch (err) {
        console.error(err);
        return res.status(403).json({ msg: "Invalid or expired refresh token" });
    }
};

export const logOut = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({ msg: "No refresh token found" });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

            // Find the user
            const user = await User.findById(decoded.userId);
            if (user) {
                // Invalidate the stored refresh token in DB
                user.tokens = [];
                await user.save();
            }
        } catch (err) {
            // Even if verification fails (expired token), still clear cookies
            console.warn("Invalid or expired token during logout:", err.message);
        }

        // Clear both cookies
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        return res.status(200).json({ msg: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

