import apiClient from "../../api/client";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const listarUsuariosDisponibles = async () => {
  const response = await apiClient.get("/usuario/usuarios-disponibles", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const listarSolicitudesRecibidas = async () => {
  const response = await apiClient.get("/usuario/solicitudes/recibidas", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const listarSolicitudesEnviadas = async () => {
  const response = await apiClient.get("/usuario/solicitudes/enviadas", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const enviarSolicitud = async (usuarioId) => {
  const response = await apiClient.post(`/usuario/solicitudes/${usuarioId}`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const aceptarSolicitud = async (solicitudId) => {
  const response = await apiClient.put(`/usuario/solicitudes/${solicitudId}/aceptar`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const rechazarSolicitud = async (solicitudId) => {
  const response = await apiClient.put(`/usuario/solicitudes/${solicitudId}/rechazar`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const listarAmigos = async () => {
  const response = await apiClient.get("/usuario/amigos", {
    headers: getAuthHeaders(),
  });
  return response.data;
};
