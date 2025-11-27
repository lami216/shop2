import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { buildValidationError } from "../lib/validators.js";

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

const enforceRole = (role) => (req, res, next) => {
        if (!req.user?.role) {
                return res.status(401).json(buildValidationError("Unauthorized - missing user context"));
        }

        if (req.user.role !== role) {
                return res.status(403).json({ message: `Access denied - ${role}s only` });
        }

        next();
};

export const requireStudent = enforceRole("student");
export const requireTutor = enforceRole("tutor");
export const requireAdmin = enforceRole("admin");

export const requireStudentOrTutor = (req, res, next) => {
        if (!req.user?.role) {
                return res.status(401).json(buildValidationError("Unauthorized - missing user context"));
        }

        if (!["student", "tutor"].includes(req.user.role)) {
                return res.status(403).json({ message: "Access denied - Students or tutors only" });
        }

        next();
};

export const protectRoute = protect;
export const adminRoute = requireAdmin;
