// controllers/RecommendationController.js
import User from "../models/UserModels.js";
import { Adventure, Beaches, City, NatureBeauty, HistoricalAndCultural } from "../models/index.js";

/**
 * Utility function to map destination types to collections
 */
const collectionMap = {
    adventure: Adventure,
    beaches: Beaches,
    city: "Cities",
    nature_beauty: "Nature's Beauty",
    historical_and_cultural: "Historical and Cultural",
};

/**
 * @desc Recommend destinations based on user's favorite categories
 * @route GET /api/recommend/:userId/:param1?/:param2?
 */
export const recommendDestinations = async (req, res) => {
    try {
        const userId = req.user._id;
        const { param1, param2 } = req.params;

        // 🔹 Step 1: Fetch user & their favorite categories
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const favorite = user.favoriteCategories || {};
        const destinationTypes = favorite.destinationType || [];

        if (destinationTypes.length === 0) {
            return res.status(400).json({ message: "No favorite categories set for this user." });
        }

        // 🔹 Step 2: Collect matching destinations from all collections based on destinationType
        const allResults = [];

        for (const type of destinationTypes) {
            const normalizedType = type.toLowerCase().replace(/\s+/g, "_");
            const Model = collectionMap[normalizedType];

            if (!Model) continue;

            // Filter handling
            let query = {};

            if (!param1 && !param2) {
                // Default: recommend based on type
                query = {};
            } else if (param1 && !param2) {
                // Example: param1 = "March" → best time to visit
                query = { best_time_to_visit: { $in: [param1] } };
            } else if (param1 && param2) {
                // Example: /:userId/country/India  → filter by country
                const field = param1.toLowerCase();
                const value = param2;
                if (["country", "region", "type", "name"].includes(field)) {
                    query[field] = { $regex: new RegExp(value, "i") };
                }
            }

            const results = await Model.find(query).limit(10);
            allResults.push(...results);
        }

        if (allResults.length === 0) {
            return res.status(404).json({ message: "No destinations found for user preferences." });
        }

        // 🔹 Step 3: Optionally rank or shuffle results
        const shuffled = allResults.sort(() => Math.random() - 0.5);

        res.status(200).json({
            success: true,
            count: shuffled.length,
            recommendations: shuffled,
        });
    } catch (error) {
        console.error("Error recommending destinations:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
