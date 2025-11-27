import { apiClient } from "../lib/apiClient";

export const fetchAdminOverview = () => apiClient.get("/admin/overview");

export const fetchAdminUsers = (params) => apiClient.get("/admin/users", { params });

export const updateAdminUser = (id, payload) => apiClient.patch(`/admin/users/${id}`, payload);

export const fetchAdminTutors = (params) => apiClient.get("/admin/tutors", { params });

export const fetchAdminTutorDetail = (id) => apiClient.get(`/admin/tutors/${id}`);

export const fetchAdminAds = (params) => apiClient.get("/admin/ads", { params });

export const updateAdminAd = (id, payload) => apiClient.patch(`/admin/ads/${id}`, payload);

export const fetchAdminPayments = (params) => apiClient.get("/admin/payments", { params });

export const updateAdminPayment = (id, payload) => apiClient.patch(`/admin/payments/${id}`, payload);

export const fetchAdminColleges = () => apiClient.get("/admin/colleges");

export const createAdminCollege = (payload) => apiClient.post("/admin/colleges", payload);

export const fetchAdminMajors = () => apiClient.get("/admin/majors");

export const createAdminMajor = (payload) => apiClient.post("/admin/majors", payload);

export const fetchAdminSubjects = () => apiClient.get("/admin/subjects");

export const createAdminSubject = (payload) => apiClient.post("/admin/subjects", payload);

export const fetchAdminBadges = () => apiClient.get("/admin/badges");

export const updateAdminBadge = (id, payload) => apiClient.patch(`/admin/badges/${id}`, payload);
