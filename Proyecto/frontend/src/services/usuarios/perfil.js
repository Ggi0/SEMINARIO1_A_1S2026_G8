import apiClient from "../../api/client";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const obtenerPerfil = async () => {
  const response = await apiClient.get("/usuario/perfil", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const actualizarPerfil = async (payload) => {
  const response = await apiClient.put("/usuario/perfil", payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
