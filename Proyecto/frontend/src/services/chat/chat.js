import apiClient from "../../api/client";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const listarChats = async () => {
  const response = await apiClient.get("/chat", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const listarMensajes = async (chatId) => {
  const response = await apiClient.get(`/chat/${chatId}/mensajes`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const enviarMensajeHttp = async (chatId, mensaje) => {
  const response = await apiClient.post(
    `/chat/${chatId}/mensajes`,
    { mensaje },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export function getChatWsUrl() {
  const token = localStorage.getItem("accessToken");
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");
  const wsBaseUrl = baseUrl.replace(/^http/, "ws");

  return `${wsBaseUrl}/ws?token=${encodeURIComponent(token || "")}`;
}
