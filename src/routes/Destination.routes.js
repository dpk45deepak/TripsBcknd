import express from "express";
import {
    getDestinationById,
    getDestinationsByFilter,
    getDestinationsByBestTime,
    CreateDestination,
    UpdateDestination,
    DeleteDestination,
    GetDestinations,
    GetDestinationsByType
} from "../controllers/DestinationController.js";

const router = express.Router();

// Create and Get all
router.post("/", CreateDestination);
router.get("/", GetDestinations);

// Filter and best-time endpoints (by collection type)
router.get("/:type/filter", getDestinationsByFilter);
router.get("/:type/best-time-to-visit", getDestinationsByBestTime);

// get by type
router.get("/:type", GetDestinationsByType);
// Get by type and id
router.get("/:type/:id", getDestinationById);

// Update and Delete by id (type can be provided in body or query as implemented in controller)
router.put("/:id", UpdateDestination);
router.delete("/:id", DeleteDestination);

export default router;
