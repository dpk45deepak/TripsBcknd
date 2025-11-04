import express from "express";
import passport from "../config/passport.js";
import Authenticate from "../middlewares/authenticateMiddleware.js";
import {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
    googleCallback,
    logoutUser
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


// Step 1: Frontend hits this route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google redirects back here
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        // ✅ Redirect to your frontend dashboard or home
        res.redirect("http://localhost:5173/home");
    }
);


// Step 3: Logout route
router.get("/logout", logoutUser);

// Optional failure handler
router.get("/failure", (req, res) => res.status(401).json({ success: false, message: "Authentication failed" }));


export default router;
