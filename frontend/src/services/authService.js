import apiClient from "../lib/apiClient";

export const registerUser = async (payload) => {
        // TODO: add stronger validation and student/tutor specific onboarding steps
        return apiClient.post("/auth/register", payload);
};

export const loginUser = async (payload) => {
        return apiClient.post("/auth/login", payload);
};

export const logoutUser = async () => {
        return apiClient.post("/auth/logout");
};

export const getCurrentUser = async () => {
        return apiClient.get("/auth/me");
};

export default {
        registerUser,
        loginUser,
        logoutUser,
        getCurrentUser,
};
