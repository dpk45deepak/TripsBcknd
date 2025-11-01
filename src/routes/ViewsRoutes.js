import express from "express";
import Authenticate from "../middlewares/authenticate.middleware.js";
import verifyDbAdmin from "../middlewares/dbAdmin.middleware.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const router = express.Router();



// Render the main index view. If EJS rendering
// fails (view missing), fallback to public/index.html
router.get("/", (req, res) => {
    console.log("[ROUTE] GET /");
    res.render("index", {}, (err, html) => {
        if (err) {
            // fallback to project-root/public/index.html
            return res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
        }
        res.send(html);
    });
});

// Documents view - public guide
router.get("/documents", (req, res) => {
    res.render("document", { user: req.user || null }, (err, html) => {
        if (err) return res.status(500).send("Failed to render Documents Guide!");
        res.send(html);
    });
});




// Auth view
router.get("/auth", (req, res) => {
    console.log("[ROUTE] GET /auth");
    res.render("Auth", {}, (err, html) => {
        if (err) return res.sendStatus(500);
        res.send(html);
    });
});

// Dashboard view - protected route (requires authentication + db admin)
router.get("/dashboard", Authenticate, verifyDbAdmin, (req, res) => {
    console.log("[ROUTE] GET /dashboard");
    res.render("Dashboard", {}, (err, html) => {
        if (err) return res.sendStatus(500);
        res.send(html);
    });
});

export default router;