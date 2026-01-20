import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// 🧠 Import database connection and passport config
import connectDB from "./src/DBConfig/DBconfig.js";
import passport from "./src/config/passport.js"; // this imports configured passport (only once)

// 🧩 Import routes
import authRouter from "./src/routes/AuthRoutes.js";
import userRouter from "./src/routes/UserRoutes.js";
import destinationRouter from "./src/routes/DestinationRoutes.js";
import recommendationRouter from "./src/routes/RecommendationRoutes.js";
import viewsRouter from "./src/routes/ViewsRoutes.js";

dotenv.config();

// 🛠 Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ✅ Connect to MongoDB
connectDB();

// 🌐 Allowed frontend origin
const allowedOrigin = process.env.CORS_ORIGIN;

// 🧱 Rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500,
  message: "Too many requests from this IP, please try again after an hour!",
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔒 CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === allowedOrigin || origin.startsWith(allowedOrigin)) {
        return callback(null, true);
      } else {
        console.error(`🚫 Origin not allowed: ${origin}`);
        return callback(new Error("Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // allows cookies/sessions
  })
);


// 🪵 Logging
app.use(morgan("dev"));

// 🖼 Static & view setup
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 📦 Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// 🧁 Session setup (must come BEFORE passport.session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true for HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// 🛰 Trust proxy (for production)
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// Initialize Passport (Google OAuth)
app.use(passport.initialize());
app.use(passport.session());

// ✅ Basic Health Check Route
app.get("/api", (req, res) => {
  res.json({ msg: "Backend running smoothly!! ✅ " });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// EJS routes
app.use("/", viewsRouter);

// Apply rate limiter to all /api routes
app.use("/api", apiLimiter);

// Main API Routes
app.use("/api/auth", authRouter); // Google OAuth routes included here
app.use("/api/users", userRouter);
app.use("/api/destinations", destinationRouter);
app.use("/api/recommendations", recommendationRouter);

export default app;
