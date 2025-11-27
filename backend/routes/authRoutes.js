import express from "express";

import { getMe, login, logout, register } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { buildValidationError, isNonEmptyString, isValidEmail, isValidRole } from "../lib/validators.js";
import User from "../models/user.model.js";

const router = express.Router();

const validateRegisterPayload = async (req, res, next) => {
        const { name, email, password, role } = req.body || {};

        if (!isNonEmptyString(name) || !isValidEmail(email) || !isNonEmptyString(password)) {
                return res
                        .status(400)
                        .json(buildValidationError("Name, valid email, and password are required"));
        }

        if (String(password).trim().length < 8) {
                return res.status(400).json(buildValidationError("Password must be at least 8 characters"));
        }

        if (role && !isValidRole(role)) {
                return res.status(400).json(buildValidationError("Invalid role"));
        }

        const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (existingUser) {
                return res.status(400).json(buildValidationError("User already exists"));
        }

        return next();
};

const validateLoginPayload = (req, res, next) => {
        const { email, password } = req.body || {};

        if (!isValidEmail(email) || !isNonEmptyString(password)) {
                return res.status(400).json(buildValidationError("Email and password are required"));
        }

        if (String(password).trim().length < 6) {
                return res.status(400).json(buildValidationError("Password must be at least 6 characters"));
        }

        return next();
};

router.post("/register", validateRegisterPayload, register);
router.post("/login", validateLoginPayload, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
