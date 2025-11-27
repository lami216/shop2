import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

const normalizeString = (value) => {
        if (value === undefined || value === null) {
                return "";
        }

        return value.toString().trim();
};

const normalizeEmail = (value) => normalizeString(value).toLowerCase();
const ACCESS_TOKEN_SECRET =
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "moltaqa-dev-secret";

const signToken = (userId) => {
        return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
};

const setAuthCookie = (res, token) => {
        res.cookie("accessToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
        });
};

const buildUserResponse = (user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        phone: user.phone,
        gender: user.gender,
        avatar: user.avatar,
});

export const register = async (req, res) => {
        try {
                const name = normalizeString(req.body?.name);
                const email = normalizeEmail(req.body?.email);
                const password = normalizeString(req.body?.password);
                const phone = normalizeString(req.body?.phone);
                const gender = normalizeString(req.body?.gender);
                const role = normalizeString(req.body?.role) || "student";
                const language = normalizeString(req.body?.language) || "ar";

                if (!name || !email || !password) {
                        return res.status(400).json({ message: "Name, email, and password are required" });
                }

                const allowedRoles = ["student", "tutor", "admin"];
                if (!allowedRoles.includes(role)) {
                        return res.status(400).json({ message: "Invalid role" });
                }

                const existingUser = await User.findOne({ email });

                if (existingUser) {
                        return res.status(400).json({ message: "User already exists" });
                }

                const user = await User.create({
                        name,
                        email,
                        password,
                        phone,
                        gender,
                        role,
                        language,
                        // TODO: link StudentProfile and TutorProfile after onboarding
                });

                const token = signToken(user._id);
                setAuthCookie(res, token);

                res.status(201).json(buildUserResponse(user));
        } catch (error) {
                console.log("Error in register controller", error.message);
                res.status(500).json({ message: error.message });
        }
};

export const login = async (req, res) => {
        try {
                const email = normalizeEmail(req.body?.email);
                const password = normalizeString(req.body?.password);

                const user = await User.findOne({ email });

                if (!user) {
                        return res.status(400).json({ message: "Invalid email or password" });
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                        return res.status(400).json({ message: "Invalid email or password" });
                }

                const token = signToken(user._id);
                setAuthCookie(res, token);

                res.json(buildUserResponse(user));
        } catch (error) {
                console.log("Error in login controller", error.message);
                res.status(500).json({ message: error.message });
        }
};

export const logout = async (req, res) => {
        try {
                res.clearCookie("accessToken");
                res.json({ message: "Logged out successfully" });
        } catch (error) {
                console.log("Error in logout controller", error.message);
                res.status(500).json({ message: "Server error", error: error.message });
        }
};

export const getMe = async (req, res) => {
        try {
                const user = await User.findById(req.user._id).select("-password");
                res.json(user ? buildUserResponse(user) : null);
        } catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
        }
};
