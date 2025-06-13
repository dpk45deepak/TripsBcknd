import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    logOut,
    refreshToken,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register a new user
router.post("/register", (req, res, next) => {
    console.log("[ROUTE] POST /user/register");
    registerUser(req, res, next);
});

// Login user
router.post("/login", (req, res, next) => {
    console.log("[ROUTE] POST /user/login");
    loginUser(req, res, next);
});

// Logout user (client should just delete token, but endpoint for completeness)
router.post("/logout", authMiddleware, (req, res, next) => {
    console.log("[ROUTE] POST /user/logout");
    logOut(req, res, next);
});

// Get user profile (protected route)
router.get("/profile", authMiddleware, (req, res, next) => {
    console.log("[ROUTE] GET /user/profile");
    getUserProfile(req, res, next);
});

// Refresh access token
router.post("/refresh-token", (req, res, next) => {
    console.log("[ROUTE] POST /user/refresh-token");
    refreshToken(req, res, next);
});

export default router;
