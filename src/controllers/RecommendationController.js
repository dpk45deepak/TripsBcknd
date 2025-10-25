// controllers/recommendationController.js
import {
    Adventure,
    Beaches,
    City,
    NatureBeauty,
    HistoricalAndCultural,
} from "../models/index.js";
import User from "../models/user.models.js";

// Helper to map category names to their corresponding Mongoose models
const categoryModelMap = {
    adventure: Adventure,
    beaches: Beaches,
    city: City,
    nature_beauty: NatureBeauty,
    historical_and_cultural: HistoricalAndCultural,
};

/**
 * @desc Recommend destinations to a user based on favouriteCategories
 * @route GET /api/recommendations/:userId
 * @access Private / Authenticated
 */
export const recommendDestinations = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1️⃣ Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2️⃣ Get favourite categories
        const favouriteCategories = user.favouriteCategories || [];
        if (favouriteCategories.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No favourite categories found for this user.",
                recommendations: [],
            });
        }

        // 3️⃣ Fetch destinations from each relevant category
        const recommendations = [];
        for (const category of favouriteCategories) {
            const model = categoryModelMap[category.toLowerCase()];
            if (model) {
                // You can tweak this limit for better results
                const destinations = await model.aggregate([
                    { $sample: { size: 4 } }, // randomly pick 4 destinations
                ]);
                recommendations.push(...destinations);
            }
        }

        // 4️⃣ Remove duplicates (in case same destination exists in multiple categories)
        const uniqueRecommendations = recommendations.filter(
            (item, index, self) =>
                index === self.findIndex((t) => t._id.toString() === item._id.toString())
        );

        // 5️⃣ Return results
        res.status(200).json({
            success: true,
            total: uniqueRecommendations.length,
            recommendations: uniqueRecommendations,
        });
    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching recommendations.",
            error: error.message,
        });
    }
};
