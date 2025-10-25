// routes/recommendationRoutes.js
import express from "express";
import { recommendDestinations } from "../controllers/RecommendationController.js";

const router = express.Router();

// GET recommendations for a user
router.get("/:userId", recommendDestinations);

export default router;
