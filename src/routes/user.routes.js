import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    logOut,
    refreshToken,
    setFavouriteCategories
} from "../controllers/UserController.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register a new user
router.post("/register", (req, res, next) => {
    console.log("[ROUTE] POST /users/register");
    registerUser(req, res, next);
});

// Login user
router.post("/login", (req, res, next) => {
    console.log("[ROUTE] POST /users/login");
    loginUser(req, res, next);
});

// Logout user (client should just delete token, but endpoint for completeness)
router.post("/logout", authMiddleware, (req, res, next) => {
    console.log("[ROUTE] POST /users/logout");
    logOut(req, res, next);
});

// Get user profile (protected route)
router.get("/profile", authMiddleware, (req, res, next) => {
    console.log("[ROUTE] GET /users/profile");
    getUserProfile(req, res, next);
});

// Refresh access token
router.post("/refresh-token", (req, res, next) => {
    console.log("[ROUTE] POST /users/refresh-token");
    refreshToken(req, res, next);
});

// Set or update user's favourite categories
// router.put("/favourite-categories", authMiddleware, (req, res, next) => {
router.put("/:userId/favourite-categories", (req, res, next) => {
    console.log("[ROUTE] PUT /users/:userId/favourite-categories");
    setFavouriteCategories(req, res, next);
});

export default router;
