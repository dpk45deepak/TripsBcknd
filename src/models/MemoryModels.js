import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        location: {
            type: String,
        },
        date: {
            type: String, // or Date if you want real date operations
        },
        travelers: [
            {
                type: String,
            },
        ],
        images: [
            {
                type: String,
            },
        ],
        videos: [
            {
                type: String,
            },
        ],
        tags: [
            {
                type: String,
            },
        ],
        likes: {
            type: Number,
            default: 0,
        },
        comments: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
            default: 0,
        },
        saves: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            enum: ["photo", "video"],
            default: "photo",
        },
        color: {
            type: String,
        },
        tripId: {
            type: String,
            required: true,
        },
        tripName: {
            type: String,
        },
        mood: {
            type: String,
            enum: ["happy", "peaceful", "excited", "sad", "romantic", "adventurous"],
            default: "happy",
        },
        privacy: {
            type: String,
            enum: ["public", "private", "friends"],
            default: "private",
        },
        isLiked: {
            type: Boolean,
            default: false,
        },
        isSaved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // this will auto handle createdAt & updatedAt
    }
);

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
