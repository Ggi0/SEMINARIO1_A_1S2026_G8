import apiClient from "../../api/client";

const UPLOAD_PUBLI_URL = import.meta.env.VITE_UPLOAD_PUBLI_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getPublicaciones = async (params = {}) => {
  const response = await apiClient.get("/publicaciones", {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getEtiquetas = async (buscar = "") => {
  const response = await apiClient.get("/publicaciones/etiquetas", {
    params: buscar ? { buscar } : {},
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const crearPublicacion = async (payload) => {
  const response = await apiClient.post("/publicaciones", payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const crearComentario = async (publicacionId, comentario) => {
  const response = await apiClient.post(
    `/publicaciones/${publicacionId}/comentarios`,
    { comentario },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const traducirTexto = async (texto, idiomaDestino) => {
  const response = await apiClient.post(
    "/publicaciones/traducir",
    { texto, idiomaDestino },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const subirImagenPublicacion = async (base64, file) => {
  if (!UPLOAD_PUBLI_URL) {
    throw new Error("Falta VITE_UPLOAD_PUBLI_URL en variables de entorno");
  }

  const res = await fetch(UPLOAD_PUBLI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64,
      filename: file.name,
      contentType: file.type,
    }),
  });

  return await res.json();
};