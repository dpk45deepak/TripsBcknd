import express from "express";
import passport from "../config/passport.js";
import dotenv from "dotenv";
import User from '../models/UserModels.js';
import generateTokens from "../utils/generateTokens.js";
import Authenticate from "../middlewares/authenticateMiddleware.js";
import {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
} from "../controllers/AuthController.js";

const router = express.Router();
dotenv.config();

// Register a new user
router.post("/register", (req, res, next) => {
    console.log("POST /users/register");
    registerUser(req, res, next);
});

// Login user
router.post("/login", (req, res, next) => {
    console.log("POST /users/login");
    loginUser(req, res, next);
});

// Logout user (client should just delete token, but endpoint for completeness)
router.post("/logout", Authenticate, (req, res, next) => {
    console.log("POST /users/logout");
    logOut(req, res, next);
});

// Refresh access token
router.post("/refresh-token", (req, res, next) => {
    console.log("/users/refresh-token");
    refreshAccessToken(req, res, next);
});


// Step 1: Frontend hits this route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google redirects back here
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    async (req, res) => {
        // Handle Google OAuth callback
        const profile = req.user;

        // Ensure email is present
        if (!profile.emails || !profile.emails.length) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`);
        }

        // Extract user info from profile
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        const profilePic = profile.photos?.[0]?.value || "";

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                username: name,
                googleId,
                profilePic,
                provider: "google",
                emailVerified: true,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.provider = "google";
            user.emailVerified = true;
            await user.save();
        }

        const tokens = generateTokens(user);
        user.tokens = [{ refreshToken: tokens.refreshToken }];
        await user.save();

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 45 * 24 * 60 * 60 * 1000,
        });

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL}/home`);
    }
);

// Optional failure handler
router.get("/failure", (req, res) => res.status(401).json({ success: false, message: "Authentication failed" }));


export default router;
