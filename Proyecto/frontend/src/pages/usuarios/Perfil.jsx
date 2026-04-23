import { useEffect, useState } from "react";
import { subirImagen } from "../../services/sesion/sesion";
import { actualizarPerfil, obtenerPerfil } from "../../services/usuarios/perfil";
import "./Perfil.css";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Perfil() {
  const [form, setForm] = useState({
    nombre_completo: "",
    dpi: "",
    password: "",
  });
  const [fotoActual, setFotoActual] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    obtenerPerfil()
      .then((res) => {
        if (!res.ok) {
          setMensaje(res.mensaje || "No se pudo cargar el perfil");
          return;
        }

        setForm((prev) => ({
          ...prev,
          nombre_completo: res.usuario.nombre_completo || "",
          dpi: res.usuario.dpi || "",
        }));
        setFotoActual(res.usuario.foto_perfil_url || "");
      })
      .catch(() => setMensaje("Inicia sesion para editar tu perfil"));
  }, []);

  useEffect(() => {
    if (!archivo) {
      setPreviewFoto("");
      return;
    }

    const objectUrl = URL.createObjectURL(archivo);
    setPreviewFoto(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [archivo]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!form.password) {
      setMensaje("Debes ingresar tu contrasena actual");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...form };

      if (archivo) {
        setMensaje("Subiendo nueva foto...");
        const base64 = await fileToBase64(archivo);
        const upload = await subirImagen(base64, archivo);

        if (!upload.ok) {
          throw new Error(upload.mensaje || upload.error || "No se pudo subir la imagen");
        }

        payload.foto_perfil_url = upload.url;
        payload.foto_perfil_s3_key = upload.key;
      }

      setMensaje("Actualizando perfil...");
      const res = await actualizarPerfil(payload);

      if (!res.ok) {
        throw new Error(res.mensaje || "No se pudo actualizar el perfil");
      }

      setFotoActual(res.usuario.foto_perfil_url || "");
      setArchivo(null);
      setForm((prev) => ({ ...prev, password: "" }));
      setMensaje("Perfil actualizado correctamente");
    } catch (error) {
      setMensaje(error?.response?.data?.mensaje || error?.message || "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const fotoMostrada = previewFoto || fotoActual;

  return (
    <main className="perfil-page">
      <section className="perfil-hero">
        <p className="perfil-eyebrow">Cuenta Semi-Social</p>
        <h1>Editar perfil</h1>
        <p className="perfil-subtitle">
          Actualiza tu informacion publica. Para proteger tu cuenta, confirmamos tu
          contrasena antes de guardar cambios.
        </p>
      </section>

      <section className="perfil-card">
        <aside className="perfil-photo-panel">
          <div className="perfil-photo-frame">
            {fotoMostrada ? (
              <img src={fotoMostrada} alt="Foto de perfil" className="perfil-photo" />
            ) : (
              <span className="perfil-photo-placeholder">
                {form.nombre_completo ? form.nombre_completo.charAt(0).toUpperCase() : "S"}
              </span>
            )}
          </div>

          <div className="perfil-photo-copy">
            <strong>{form.nombre_completo || "Tu perfil"}</strong>
            <span>{archivo ? "Nueva foto lista para guardar" : "Foto usada para login facial"}</span>
          </div>

          <label className="perfil-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
            Cambiar foto
          </label>

          {archivo ? <p className="perfil-file-name">{archivo.name}</p> : null}
        </aside>

        <form className="perfil-form" onSubmit={handleSubmit}>
          <div className="perfil-form-header">
            <h2>Datos personales</h2>
            <p>Estos datos tambien se sincronizan con Cognito.</p>
          </div>

          <label className="perfil-field">
            <span>Nombre completo</span>
            <input
              name="nombre_completo"
              placeholder="Ej. Maria Lopez"
              value={form.nombre_completo}
              onChange={handleChange}
            />
          </label>

          <label className="perfil-field">
            <span>DPI</span>
            <input
              name="dpi"
              placeholder="Ej. 1234567890101"
              value={form.dpi}
              onChange={handleChange}
            />
          </label>

          <label className="perfil-field">
            <span>Contrasena actual</span>
            <input
              type="password"
              name="password"
              placeholder="Necesaria para guardar"
              value={form.password}
              onChange={handleChange}
            />
          </label>

          {mensaje ? <p className="perfil-message">{mensaje}</p> : null}

          <div className="perfil-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Guardando cambios..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Perfil;
