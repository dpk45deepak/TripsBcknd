
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./src/DBConfig/DBconfig.js";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT;

connectDB()
    .then(() => {
        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT} ✅ `);
        });
    })
    .catch((err) => {
        console.log(`MongoDB connection error!`, err);
    });
