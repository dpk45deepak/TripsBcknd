// middlewares/dbAdmin.middleware.js
const verifyDbAdmin = (req, res, next) => {
    try {
        // Assuming user info is stored in req.user (after JWT verification)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ msg: "Unauthorized. Please log in first." });
        }
        if (user.role !== "dbAdmin") {
            return res.status(403).json({ msg: "Access denied. DB Admins only." });
        }
        // All good ✅
            next();

    } catch (error) {
        console.error("Error in DB Admin middleware:", error);
        res.status(500).json({ msg: "Internal server error." });
    }
};

export default verifyDbAdmin;