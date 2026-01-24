import express from "express";
import {
    createMemory,
    getMemories,
    getMemoryById,
    updateMemory,
    deleteMemory,
    toggleLike,
    toggleSave,
} from "../controllers/MemoryController.js";

const router = express.Router();

// Create & Get all memories
router.route("/")
    .post(createMemory)     // POST /api/memories
    .get(getMemories);     // GET  /api/memories?userId=&tripId=

// Get, Update, Delete single memory
router.route("/:id")
    .get(getMemoryById)    // GET    /api/memories/:id
    .put(updateMemory)    // PUT    /api/memories/:id
    .delete(deleteMemory);// DELETE /api/memories/:id

// Toggle like & save
router.patch("/:id/like", toggleLike); // PATCH /api/memories/:id/like
router.patch("/:id/save", toggleSave); // PATCH /api/memories/:id/save

export default router;
