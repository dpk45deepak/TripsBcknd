// routes/recommendationRoutes.js
import express from "express";
import Authenticate from "../middlewares/authenticate.middleware.js";
import { recommendDestinations } from "../controllers/RecommendationController.js";

const router = express.Router();

// Single route that supports multiple shapes:
// GET /:userId
// GET /:userId/:month   -> best time to visit (month)
// GET /:userId/:filter/:value   -> filter by field (e.g. type, country, region)
router.get("/:userId/:param1?/:param2?", Authenticate, recommendDestinations);

export default router;
