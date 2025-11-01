import express from "express";
import Authenticate from "../middlewares/authenticate.middleware.js";
import {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken
} from "../controllers/AuthController.js";

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
router.post("/logout", Authenticate, (req, res, next) => {
    console.log("[ROUTE] POST /users/logout");
    logOut(req, res, next);
});

// Refresh access token
router.post("/refresh-token", Authenticate, (req, res, next) => {
    console.log("[ROUTE] POST /users/refresh-token");
    refreshAccessToken(req, res, next);
});


export default router;
