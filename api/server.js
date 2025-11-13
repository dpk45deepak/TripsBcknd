import dotenv from "dotenv";
import connectDB from "../src/DBConfig/DBconfig.js";
import app from "../app.js";

// Load environment variables
dotenv.config();

// Connect DB (Vercel runs this once per cold start)
connectDB().then(() => {
    console.log("✅ MongoDB connected successfully on Vercel");
}).catch(err => {
    console.error("❌ MongoDB connection failed:", err);
});

// Export as a serverless function for Vercel
export default function handler(req, res) {
    return app(req, res);
}
