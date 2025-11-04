import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/UserModels.js";
import generateTokens from "../utils/generateTokens.js"; // same function jo registerUser me use ho rahi hai

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true, // ✅ Needed to access res object
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // 🆕 New user registration
                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value,
                        profilePic: profile.photos?.[0]?.value,
                        role: "user",
                        tokens: [],
                    });

                    const tokens = generateTokens(user);
                    user.tokens = [{ refreshToken: tokens.refreshToken }];
                    await user.save();

                    // ✅ Set cookies (same as registerUser)
                    req.res.cookie("refreshToken", tokens.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "None",
                        maxAge: 45 * 24 * 60 * 60 * 1000,
                    });

                    req.res.cookie("accessToken", tokens.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "None",
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                    });
                } else {
                    // 🧠 Existing user — refresh tokens
                    const tokens = generateTokens(user);
                    user.tokens = [{ refreshToken: tokens.refreshToken }];
                    await user.save();

                    req.res.cookie("refreshToken", tokens.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "None",
                        maxAge: 45 * 24 * 60 * 60 * 1000,
                    });

                    req.res.cookie("accessToken", tokens.accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "None",
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                    });
                }

                return done(null, user);
            } catch (err) {
                console.error("Google OAuth error:", err);
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;
