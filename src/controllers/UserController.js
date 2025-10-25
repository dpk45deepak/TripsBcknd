// HYBRID JWT AUTH (ACCESS + REFRESH TOKEN STORED IN DB)
import User from '../models/user.models.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets are not configured');
}

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, username: user.username, email: user.email },
    ACCESS_SECRET,
    { expiresIn: '30d' }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, username: user.username, email: user.email },
    REFRESH_SECRET,
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ( !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User({
      email,
      password,
      tokens: []
    });

    const tokens = generateTokens(newUser);
    newUser.tokens.push({ refreshToken: tokens.refreshToken });

    await newUser.save();
    console.log(`New user registered with email: ${newUser.email}`); // Debugging line

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'User registered',
      accessToken: tokens.accessToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        favoriteCategories: newUser.favoriteCategories || {}
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log(`user: ${user.username} with email: ${user.email} is trying to login with password: ${password}`); // Debugging line

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);
    user.tokens.push({ refreshToken: tokens.refreshToken });
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      accessToken: tokens.accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoriteCategories: user.favoriteCategories || {}
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    console.log(`user: ${user.username} with email: ${user.email} is trying to refresh token`); // Debugging line

    if (!user || !user.tokens.some(t => t.refreshToken === token)) {
      return res.status(403).json({ message: 'Refresh token invalid or revoked' });
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Refresh token expired' });
    }
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const getUserProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findOne({ _id: decoded.userId }).select('-password -tokens');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const logOut = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        await User.updateOne(
          { _id: decoded.userId },
          { $pull: { tokens: { refreshToken: token } } }
        );
      } catch (e) {
        // Token verification failed (might be expired), but we still clear the cookie
      }
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// // SET OR UPDATE USER'S FAVOURITE CATEGORIES
// export const setFavouriteCategories = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, ACCESS_SECRET);
//     const userId = decoded.userId;

//     const { favouriteCategories } = req.body;

//     // Validate input
//     if (!Array.isArray(favouriteCategories) || favouriteCategories.length === 0) {
//       return res.status(400).json({
//         message: "favouriteCategories must be a non-empty array",
//       });
//     }

//     // Normalize category names (lowercase)
//     const validCategories = [
//       "adventure",
//       "beaches",
//       "city",
//       "nature_beauty",
//       "historical_and_cultural",
//     ];

//     const normalizedCategories = favouriteCategories.map((cat) =>
//       cat.toLowerCase().trim()
//     );

//     const invalid = normalizedCategories.filter(
//       (cat) => !validCategories.includes(cat)
//     );

//     if (invalid.length > 0) {
//       return res.status(400).json({
//         message: `Invalid categories: ${invalid.join(", ")}`,
//         validCategories,
//       });
//     }

//     // Update user document
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { favouriteCategories: normalizedCategories },
//       { new: true, select: "-password -tokens" }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json({
//       message: "Favourite categories updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Error updating favourite categories:", error);
//     if (error.name === "TokenExpiredError") {
//       return res.status(403).json({ message: "Access token expired" });
//     }
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


export const setFavouriteCategories = async (req, res) => {
  try {
    const userId = req.params.userId || req.params.id || req.body.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: "userId is required (route param :userId/:id, body.userId or authenticated user)" });
    }

    // Accept multiple possible incoming field names (typos / British vs American)
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
      return res.status(400).json({ message: "Provide at least one preference to update" });
    }

    const validCategories = new Set([
      "adventure",
      "beaches",
      "city",
      "cities",
      "nature_beauty",
      "historical_and_cultural",
      "forests",
      "deserts",
      "mountains",
      "islands",
      "rivers",
      "lakes",
    ]);

    const updateDoc = {};

    if (rawDestTypes !== undefined) {
      const normalizedDestinations = normalizeAndUniqueArray(rawDestTypes);
      const invalid = normalizedDestinations.filter(c => !validCategories.has(c));
      if (invalid.length) {
        return res.status(400).json({
          message: `Invalid categories: ${invalid.join(", ")}`,
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
        return res.status(400).json({ message: "favouriteBudget must be a number or numeric string" });
      }
      updateDoc["favoriteCategories.budget"] = parsed;
    }

    // nothing to update (shouldn't happen because of earlier check) guard
    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ message: "No valid preferences provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateDoc },
      { new: true, select: "-password -tokens", runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Favourite preferences updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating favourite preferences:", error);
    if (error.name === "CastError") return res.status(400).json({ message: "Invalid userId" });
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    return res.status(500).json({ message: "Internal server error" });
  }
};