import apiClient from "../api/client";

export const getApiStatus = async () => {
  const response = await apiClient.get("/");
  return response.data;
};