import mongoose from "mongoose";

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

export const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (value) => {
        if (!isNonEmptyString(value)) return false;
        const normalized = value.trim();
        const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return basicPattern.test(normalized);
};

export const isValidRole = (role) => ["student", "tutor", "admin"].includes(role);

export const isValidEnum = (value, allowed) => allowed.includes(value);

export const ensurePositiveNumber = (value) => typeof value === "number" && !Number.isNaN(value) && value > 0;

export const buildValidationError = (message) => ({ message });
