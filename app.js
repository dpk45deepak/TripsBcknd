import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Routes imports
import authRouter from "./src/routes/Auth.Routes.js";
import userRouter from "./src/routes/User.Routes.js";
import destinationRouter from "./src/routes/Destination.Routes.js";
import recommendationRouter from "./src/routes/Recommendation.Routes.js";
import viewsRouter from "./src/routes/Views.Routes.js";

dotenv.config();

// Handling __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Allowed frontend origin
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500,
  message: "Too many requests from this IP, please try again after an hour!",
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === allowedOrigin || origin.startsWith(allowedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // allows sending cookies/sessions
  })
);

// Logging
app.use(morgan("dev"));

// Static & view setup
app.use(express.static(path.join(__dirname, "public")));
// set views to the local `views` folder (was incorrectly using parent dir)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Session setup (must come before passport.session)
app.use(
  session({
    secret: process.env.GOOGLE_SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true for HTTPS
  })
);

// Trust proxy (if behind a proxy like Nginx or in production)
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);


// Ping endpoint
app.get("/api", (req, res) => {
  res.json({ msg: "Hello Developer! Backend is running smoothly..!!" });
});


// Mount DB / EJS routes via router (moved rendering logic into router)
app.use("/", viewsRouter);

// Default API routes
// Apply rate limiter to all /api routes
app.use("/api", apiLimiter);

// Backend Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/destinations", destinationRouter);
app.use("/api/recommendations", recommendationRouter);

export default app;
