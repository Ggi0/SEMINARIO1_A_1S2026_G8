import { useState } from "react";
import { Link } from "react-router-dom";
import { registro, subirImagen } from "../../services/sesion/sesion";
import imageCompression from "browser-image-compression";
import {
  User,
  Mail,
  Lock,
  IdCard,
  AtSign,
  ImagePlus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
  const [preview, setPreview] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const quitarImagen = () => {
    setImagen(null);
    setPreview(null);
  };

  const convertirBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  const comprimirImagen = async (file) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      return file;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setExito(false);

    if (form.password !== form.repetir_password) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    let fotoData = {};

    try {
      if (imagen) {
        if (imagen.size > 5 * 1024 * 1024) {
          setMensaje("Imagen muy grande (máx 5MB)");
          return;
        }

        const fileComprimido = await comprimirImagen(imagen);
        const base64 = await convertirBase64(fileComprimido);

        console.log("Tamaño original:", imagen.size / 1024 / 1024, "MB");
        console.log("Tamaño comprimido:", fileComprimido.size / 1024 / 1024, "MB");

        const upload = await subirImagen(base64, imagen);
        if (!upload.ok) {
          setMensaje(upload.mensaje || "Error subiendo imagen");
          return;
        }
        fotoData = { foto_perfil_url: upload.url, foto_perfil_s3_key: upload.key };
      }

      const res = await registro({ ...form, ...fotoData });
      console.log(res);

      if (res.ok) {
        setExito(true);
        setMensaje("Registro exitoso. Revisa tu correo para confirmar.");
        return;
      }

      setMensaje(res?.mensaje || "No se pudo registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "input-modern w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition";

  const fields = [
    { name: "nombre_completo", placeholder: "Nombre completo",    type: "text",     icon: <User     className="h-4 w-4" /> },
    { name: "username",        placeholder: "Nombre de usuario",  type: "text",     icon: <AtSign   className="h-4 w-4" /> },
    { name: "correo",          placeholder: "Correo electrónico", type: "email",    icon: <Mail     className="h-4 w-4" /> },
    { name: "dpi",             placeholder: "DPI",                type: "text",     icon: <IdCard   className="h-4 w-4" /> },
    { name: "password",        placeholder: "Contraseña",         type: "password", icon: <Lock     className="h-4 w-4" /> },
    { name: "repetir_password",placeholder: "Repetir contraseña", type: "password", icon: <Lock     className="h-4 w-4" /> },
  ];

  return (
    <div className="page-wrap flex items-center justify-center">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="glass-card p-8">

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow">
              <User className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Crear cuenta</h1>
            <p className="mt-1 text-sm text-gray-500">Completa los datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Campos dinámicos */}
            {fields.map(({ name, placeholder, type, icon }) => (
              <div key={name} className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {icon}
                </span>
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            ))}

            {/* Foto de perfil */}
            <div>
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-36 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={quitarImagen}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-cyan-400 hover:text-cyan-600">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Foto de perfil (opcional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImage}
                  />
                </label>
              )}
            </div>

            {/* Mensaje */}
            {mensaje && (
              <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                exito
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}>
                {exito
                  ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                }
                {mensaje}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Ya tienes cuenta?</span>
          <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">Inicia sesion</Link>
          <span>·</span>
          <Link to="/confirmar-correo" className="font-semibold text-cyan-700 hover:text-cyan-800">Confirmar correo</Link>
        </div>
      </div>
    </div>
  );
}

export default Registro;