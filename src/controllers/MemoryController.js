import mongoose from "mongoose";
import Memory from "../models/MemoryModels.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// CREATE MEMORY
export const createMemory = async (req, res) => {
    try {
        const {
            userId,
            title,
            description,
            location,
            date,
            travelers,
            images,
            videos,
            tags,
            type,
            color,
            tripId,
            tripName,
            mood,
            privacy,
        } = req.body;

        // Required validation
        if (!userId || !title || !tripId) {
            return res.status(400).json({
                success: false,
                message: "userId, title and tripId are required",
            });
        }

        // Enum validation
        if (type && !["photo", "video"].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid type value" });
        }

        if (mood && !["happy", "peaceful", "excited", "sad", "romantic", "adventurous"].includes(mood)) {
            return res.status(400).json({ success: false, message: "Invalid mood value" });
        }

        if (privacy && !["public", "private", "friends"].includes(privacy)) {
            return res.status(400).json({ success: false, message: "Invalid privacy value" });
        }

        const memory = await Memory.create({
            userId,
            title,
            description,
            location,
            date,
            travelers,
            images,
            videos,
            tags,
            type,
            color,
            tripId,
            tripName,
            mood,
            privacy,
        });

        res.status(201).json({
            success: true,
            message: "Memory created successfully",
            data: memory,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL MEMORIES (by user or trip)
export const getMemories = async (req, res) => {
    try {
        const { userId, tripId } = req.query;

        let filter = {};
        if (userId) filter.userId = userId;
        if (tripId) filter.tripId = tripId;

        const memories = await Memory.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: memories.length,
            data: memories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET SINGLE MEMORY
export const getMemoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid Memory ID" });
        }

        const memory = await Memory.findById(id);
        if (!memory) {
            return res.status(404).json({ success: false, message: "Memory not found" });
        }

        res.status(200).json({ success: true, data: memory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE MEMORY
export const updateMemory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid Memory ID" });
        }

        const updatedMemory = await Memory.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedMemory) {
            return res.status(404).json({ success: false, message: "Memory not found" });
        }

        res.status(200).json({
            success: true,
            message: "Memory updated successfully",
            data: updatedMemory,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE MEMORY
export const deleteMemory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid Memory ID" });
        }

        const deleted = await Memory.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Memory not found" });
        }

        res.status(200).json({
            success: true,
            message: "Memory deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TOGGLE LIKE
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid Memory ID" });
        }

        const memory = await Memory.findById(id);
        if (!memory) return res.status(404).json({ success: false, message: "Memory not found" });

        memory.isLiked = !memory.isLiked;
        memory.likes += memory.isLiked ? 1 : -1;

        await memory.save();

        res.status(200).json({ success: true, data: memory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TOGGLE SAVE
export const toggleSave = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid Memory ID" });
        }

        const memory = await Memory.findById(id);
        if (!memory) return res.status(404).json({ success: false, message: "Memory not found" });

        memory.isSaved = !memory.isSaved;
        memory.saves += memory.isSaved ? 1 : -1;

        await memory.save();

        res.status(200).json({ success: true, data: memory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
