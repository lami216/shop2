import { apiClient } from "../lib/apiClient";

export const initiatePayment = async (payload) => {
  return apiClient.post("/payments/initiate", payload);
};

export const getMyPayments = async () => {
  return apiClient.get("/payments/my");
};

export const uploadReceipt = async (paymentId, payload) => {
  return apiClient.put(`/payments/${paymentId}/receipt`, payload);
};

export const confirmPayment = async (paymentId, payload) => {
  return apiClient.put(`/payments/${paymentId}/confirm`, payload);
};

export const getPaymentById = async (paymentId) => {
  return apiClient.get(`/payments/${paymentId}`);
};

export default {
  initiatePayment,
  getMyPayments,
  uploadReceipt,
  confirmPayment,
  getPaymentById,
};

