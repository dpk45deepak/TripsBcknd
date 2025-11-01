// HYBRID JWT AUTH (ACCESS + REFRESH TOKEN STORED IN DB)
import User from '../models/User.Models.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured');
}

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user._id, username: user.username, email: user.email, role: user.role },
        ACCESS_SECRET,
        { expiresIn: '30d' }
    );
    const refreshToken = jwt.sign(
        { userId: user._id, username: user.username, email: user.email, role: user.role },
        REFRESH_SECRET,
        { expiresIn: '45d' }
    );
    return { accessToken, refreshToken };
};


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
        newUser.tokens.push({ refreshToken: tokens.refreshToken });

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
        // Input validation
        switch (true) {
            case !email:
                return res.status(400).json({ msg: 'Email is required' });
            case !password:
                return res.status(400).json({ msg: 'Password is required' });
        }

        // Find user
        const user = await User.findOne({ email });
        console.log(`user: ${user.username} with email: ${user.email} is trying to login with password: ${password}`); // Debugging line

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ msg: 'User not found, invalid credentials' });
        }

        const tokens = generateTokens(user);
        user.tokens.push({ refreshToken: tokens.refreshToken });
        await user.save();

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

        return res.status(200).json({
            msg: 'Login Completed Successfully!!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Login Controller error:', error);
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
        user.tokens = newTokens.refreshToken;
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
                user.tokens = null;
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


// TODO: Add Social SignUp / Login controllers later
// e.g., Google OAuth, Facebook Login, etc.