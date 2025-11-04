import User from '../models/UserModels.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const EMAIL_VERIFICATION_SECRET = process.env.EMAIL_VERIFICATION_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET || !EMAIL_VERIFICATION_SECRET) {
  throw new Error('JWT secrets are not configured');
}

// Get user profile controller
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select('-password -tokens');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ msg: 'Token expired' });
    }
    return res.status(403).json({ msg: 'Invalid token' });
  }
};



export const setFavouriteCategories = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ msg: "userId is required (route param :userId/:id, body.userId or authenticated user)" });
    }

    // Accept multiple possible incoming field names
    const {
      favouriteDestinationsTypes,
      favouriteDestinationTypes,
      favouriteActivities,
      favouriteClimates,
      favouriteDurations,
      favouriteBudget,
    } = req.body;

    // prefer either spelling
    const rawDestTypes = favouriteDestinationsTypes || favouriteDestinationTypes;

    // allow string or array for durations and coerce to desired storage format
    const normalizeAndUniqueArray = (v) => {
      if (Array.isArray(v)) {
        return [...new Set(v.map(s => String(s).toLowerCase().trim()).filter(Boolean))];
      }
      if (typeof v === 'string' && v.trim()) {
        return [v.toLowerCase().trim()];
      }
      return [];
    };

    // require at least one provided field
    if (
      rawDestTypes === undefined &&
      favouriteActivities === undefined &&
      favouriteClimates === undefined &&
      favouriteDurations === undefined &&
      favouriteBudget === undefined
    ) {
      return res.status(400).json({ msg: "Provide at least one preference to update" });
    }

    const validCategories = new Set([
      "adventure",
      "beaches",
      "city",
      "cities",
      "nature's beauty",
      "historical",
      "forests",
      "deserts",
      "mountains",
      "islands",
      "rivers",
      "lakes",
      "cultural",
      "wildlife",
    ]);

    const updateDoc = {};

    if (rawDestTypes !== undefined) {
      const normalizedDestinations = normalizeAndUniqueArray(rawDestTypes);
      const invalid = normalizedDestinations.filter(c => !validCategories.has(c));
      if (invalid.length) {
        return res.status(400).json({
          msg: `Invalid categories: ${invalid.join(", ")}`,
          validCategories: Array.from(validCategories),
        });
      }
      // schema uses 'favoriteCategories.destinationType' (array)
      updateDoc["favoriteCategories.destinationType"] = normalizedDestinations;
    }

    if (favouriteActivities !== undefined) {
      updateDoc["favoriteCategories.activities"] = normalizeAndUniqueArray(favouriteActivities);
    }

    if (favouriteClimates !== undefined) {
      updateDoc["favoriteCategories.climatePreference"] = normalizeAndUniqueArray(favouriteClimates);
    }

    if (favouriteDurations !== undefined) {
      // store as string (first value) per schema
      const normalizedDurations = normalizeAndUniqueArray(favouriteDurations);
      updateDoc["favoriteCategories.duration"] = normalizedDurations.length ? normalizedDurations[0] : "";
    }

    if (favouriteBudget !== undefined) {
      const parsed = typeof favouriteBudget === "number" ? favouriteBudget : Number(String(favouriteBudget).trim());
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ msg: "favouriteBudget must be a number or numeric string" });
      }
      updateDoc["favoriteCategories.budget"] = parsed;
    }

    // nothing to update (shouldn't happen because of earlier check) guard
    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ msg: "No valid preferences provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateDoc },
      { new: true, select: "-password -tokens", runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    return res.status(200).json({
      status: 200,
      msg: "Favourite preferences updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating favourite preferences:", error);
    if (error.name === "CastError") return res.status(400).json({ msg: "Invalid userId" });
    if (error.name === "ValidationError") return res.status(400).json({ msg: error.msg });
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    // 1️⃣ Get logged-in userId
    const userId = req.user?._id;
    console.log("Updating profile for userId:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        msg: "User ID not found in request.",
      });
    }

    // 2️⃣ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid userId format.",
      });
    }

    // 3️⃣ Define allowed fields (you can move this to a constants file)
    const ALLOWED_FIELDS = [
      "username", "bio", "email",
      "location", "budget", "themePreference",
      "notificationsEnabled", "newslettersEnabled",
      "dateOfBirth", "phone", "website",
    ];

    // 4️⃣ Build the update object dynamically
    const updates = {};
    const invalidFields = [];

    for (const [key, value] of Object.entries(req.body)) {
      if (ALLOWED_FIELDS.includes(key)) {
        updates[key] = value;
      } else {
        invalidFields.push(key);
      }
    }

    // 5️⃣ Prevent empty or invalid update requests
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        msg:
          invalidFields.length > 0
            ? `Invalid fields: ${invalidFields.join(", ")}`
            : "No valid fields provided for update.",
      });
    }

    // 6️⃣ Extra field-level validation (optional)
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email format.",
      });
    }

    // 7️⃣ Perform update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select: "-password -tokens", // never expose sensitive data
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        msg: "User not found.",
      });
    }

    // 8️⃣ Success response
    return res.status(200).json({
      success: true,
      msg: "User profile updated successfully.",
      updatedFields: Object.keys(updates),
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ success: false, msg: "Invalid userId." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, msg: error.message });
    }

    return res.status(500).json({
      success: false,
      msg: "Internal server error.",
    });
  }
};


// Verify email controller

export const verifyEmail = async (req, res) => {
  try {
    // Token from query (example: /verify-email?token=xxxx)
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ msg: "Verification token missing" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, EMAIL_VERIFICATION_SECRET);
    } catch (err) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Find the user by decoded ID or email
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // If already verified
    if (user.isVerified) {
      return res.status(200).json({ msg: "Email already verified" });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Email verified successfully. You can now log in.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        verified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    // ✅ Authenticated user ki ID (req.user me aayegi after login)
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Delete user from DB
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Logout user (destroy session)
    req.logout((err) => {
      if (err) console.error("Logout error:", err);
    });
    req.session.destroy();

    res.clearCookie("connect.sid"); // Session cookie delete

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not delete user.",
    });
  }
};


// TODO: Add history of user activity controller later

export const getUserActivityHistory = async (req, res) => {
  // Implementation will go here

  res.status(501).json({ msg: "User activity history not implemented yet." });
};



// TODO: Add password reset controller later
// TODO: Add account deletion controller later


