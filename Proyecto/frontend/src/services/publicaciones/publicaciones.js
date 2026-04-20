import apiClient from "../../api/client";

export const getPublicaciones = async () => {
  const response = await apiClient.get("/publicaciones");
  return response.data;
};