import express from "express";
import {
    createMemory,
    getMemories,
    getMemoryById,
    updateMemory,
    deleteMemory,
} from "../controllers/MemoryController.js";

const router = express.Router();

// Create & Get all
router.route("/")
    .post(createMemory)
    .get(getMemories);

// Get, Update, Delete by ID
router.route("/:id")
    .get(getMemoryById)
    .put(updateMemory)
    .delete(deleteMemory);

export default router;
