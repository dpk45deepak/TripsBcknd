import express from "express";
import Authenticate from "../middlewares/authenticateMiddleware.js";
import {
    updateUserProfile,
    setFavouriteCategories,
    getUserProfile,
    verifyEmail
} from "../controllers/UserController.js";

const router = express.Router();

router.post("/verify-email", Authenticate, (req, res, next) => {
    console.log("[ROUTE] POST /users/verify-email");
    verifyEmail(req, res, next);
});

// Get user profile (protected route)
router.get("/profile", Authenticate, (req, res, next) => {
    console.log("[ROUTE] GET /users/profile");
    getUserProfile(req, res, next);
});

router.post("/:userId/update-profile", Authenticate, (req, res, next) => {
    console.log("[ROUTE] POST /users/:userId/update-profile");
    updateUserProfile(req, res, next);
});

// Set or update user's favourite categories
router.put("/:userId/favourite-categories", Authenticate, (req, res, next) => {
    console.log("[ROUTE] PUT /users/:userId/favourite-categories");
    setFavouriteCategories(req, res, next);
});

export default router;
