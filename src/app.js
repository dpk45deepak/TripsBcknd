// Express Server imports
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Routes imports`
import userRouter from "./routes/UserRoutes.js";
import destinationRouter from "./routes/destination.routes.js";
import recommendationRouter from "./routes/Recommendation.routes.js";

dotenv.config();

// Handling __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Allowed frontend origin
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

// ⚙️ Rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 400,
  message: "Too many requests from this IP, please try again after an hour!",
  standardHeaders: true,
  legacyHeaders: false,
});

// ⚙️ CORS setup
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

// ⚙️ Static & view setup
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

// ⚙️ Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ⚙️ Session setup (must come before passport.session)
app.use(
  session({
    secret: process.env.GOOGLE_SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true for HTTPS
  })
);


// 🧩 Base route
app.get("/", (req, res) => {
  res.render("index");
});

// 🧩 Ping route
app.get("/api", (req, res) => {
  res.json({ msg: "Hello Developer! Backend is running smoothly..!!" });
});

// 🧩 Apply rate limiter to all /api routes
app.use("/api", apiLimiter);

// 🧩 Routes
app.use("/api/users", userRouter);
app.use("/api/destinations", destinationRouter);
app.use("/api/recommendations", recommendationRouter);

export default app;
