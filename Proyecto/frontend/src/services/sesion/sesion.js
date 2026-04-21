const API_URL = import.meta.env.VITE_API_URL;
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;

// LOGIN
export const login = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
};

// REGISTRO
export const registro = async (data) => {
  const res = await fetch(`${API_URL}/usuario/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
};

// CONFIRMAR CORREO
export const confirmarCorreo = async (data) => {
  const res = await fetch(`${API_URL}/usuario/confirmar-correo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await res.json();
};

// SUBIR IMAGEN (API GATEWAY)
export const subirImagen = async (base64, file) => {
  const res = await fetch(UPLOAD_URL, {
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