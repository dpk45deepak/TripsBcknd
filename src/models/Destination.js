import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        region: { type: String, required: true, trim: true },
        type: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        best_time_to_visit: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: "best_time_to_visit must be a non-empty array",
            },
        },
        average_cost_per_day: { type: Number, required: true, min: 0 },
        currency: { type: String, required: true, trim: true },
        image_url: { type: String, required: true, trim: true },
        visa_requirements: { type: String, required: true, trim: true },
        safety_rating: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        versionKey: false,
    }
);

export default destinationSchema;
