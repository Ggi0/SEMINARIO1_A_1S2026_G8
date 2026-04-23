import { useState } from "react";
import { registro, subirImagen } from "../../services/sesion/sesion";
import imageCompression from "browser-image-compression";

function Registro() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    repetir_password: "",
    correo: "",
    nombre_completo: "",
    dpi: "",
  });

  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    setImagen(e.target.files[0]);
  };

  const convertirBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  };

  const comprimirImagen = async (file) => {
    const options = {
      maxSizeMB: 1,              // máximo 1MB
      maxWidthOrHeight: 800,     // reduce resolución
      useWebWorker: true,
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      return file; // fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (form.password !== form.repetir_password) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    let fotoData = {};

    // 1. Subir imagen a API Gateway
    if (imagen) {
      if (imagen.size > 5 * 1024 * 1024) {
        alert("Imagen muy grande (máx 5MB)");
        return;
      }
      
      //  1. COMPRIMIR IMAGEN
      let fileComprimido = await comprimirImagen(imagen);
      
      //  2. CONVERTIR A BASE64
      const base64 = await convertirBase64(fileComprimido);

      console.log("Tamaño original:", imagen.size / 1024 / 1024, "MB");
console.log("Tamaño comprimido:", fileComprimido.size / 1024 / 1024, "MB");

      const upload = await subirImagen(base64, imagen);

      if (!upload.ok) {
        setMensaje(upload.mensaje || "Error subiendo imagen");
        return;
      }

      fotoData = {
        foto_perfil_url: upload.url,
        foto_perfil_s3_key: upload.key,
      };
    }

    // 2. Registrar usuario
    const res = await registro({
      ...form,
      ...fotoData,
    });

    console.log(res);

    if (res.ok) {
      setMensaje("Registro exitoso. Revisa tu correo para confirmar.");
      return;
    }

    setMensaje(res?.mensaje || "No se pudo registrar el usuario");
  };

  return (
    <div>
      <h1>REGISTRO</h1>

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} />
        <input name="correo" placeholder="Correo" onChange={handleChange} />
        <input name="nombre_completo" placeholder="Nombre" onChange={handleChange} />
        <input name="dpi" placeholder="DPI" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <input
          type="password"
          name="repetir_password"
          placeholder="Repetir password"
          onChange={handleChange}
        />

        <input type="file" onChange={handleImage} />

        <button type="submit">Registrar</button>
      </form>

      {mensaje ? <p>{mensaje}</p> : null}
    </div>
  );
}

export default Registro;