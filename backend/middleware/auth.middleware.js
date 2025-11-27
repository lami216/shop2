import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const ACCESS_TOKEN_SECRET =
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "moltaqa-dev-secret";

const extractToken = (req) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
                return authHeader.split(" ")[1];
        }

        return req.cookies?.accessToken;
};

export const protect = async (req, res, next) => {
        try {
                const token = extractToken(req);

                if (!token) {
                        return res.status(401).json({ message: "Unauthorized - No token provided" });
                }

                const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
                const user = await User.findById(decoded.userId).select("-password");

                if (!user) {
                        return res.status(401).json({ message: "User not found" });
                }

                if (user?.isActive === false) {
                        return res.status(403).json({ message: "Account is disabled" });
                }

                req.user = user;
                next();
        } catch (error) {
                if (error.name === "TokenExpiredError") {
                        return res.status(401).json({ message: "Unauthorized - Token expired" });
                }
                console.log("Error in protect middleware", error.message);
                return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
};

export const requireStudent = (req, res, next) => {
        if (req.user?.role !== "student") {
                return res.status(403).json({ message: "Access denied - Students only" });
        }

        next();
};

export const requireTutor = (req, res, next) => {
        if (req.user?.role !== "tutor") {
                return res.status(403).json({ message: "Access denied - Tutors only" });
        }

        next();
};

export const requireAdmin = (req, res, next) => {
        if (req.user?.role !== "admin") {
                return res.status(403).json({ message: "Access denied - Admin only" });
        }

        next();
};

export const protectRoute = protect;
export const adminRoute = requireAdmin;
