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
import Authenticate from "../middlewares/authenticateMiddleware.js";


const router = express.Router();

// Create and Get all
router.post("/", Authenticate, CreateDestination);
// router.get("/", Authenticate, GetDestinations);





// for few days for testing purpose making it public
router.get("/", GetDestinations);





// Filter and best-time endpoints (by collection type)
router.get("/:type/filter", Authenticate, getDestinationsByFilter);
router.get("/:type/best-time-to-visit", Authenticate, getDestinationsByBestTime);

// get by type
router.get("/:type", Authenticate, GetDestinationsByType);
// Get by type and id
router.get("/:type/:id", Authenticate, getDestinationById);

// Update and Delete by id (type can be provided in body or query as implemented in controller)
router.put("/:id", Authenticate, UpdateDestination);
router.delete("/:id", Authenticate, DeleteDestination);

export default router;
