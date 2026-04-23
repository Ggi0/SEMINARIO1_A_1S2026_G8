import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, CheckCircle, IdCard, ImagePlus, Loader2, Lock, Users, UserRound } from "lucide-react";
import { subirImagen } from "../../services/sesion/sesion";
import { actualizarPerfil, obtenerPerfil } from "../../services/usuarios/perfil";

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
  const [exito, setExito] = useState(false);
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
    setExito(false);

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

      const res = await actualizarPerfil(payload);

      if (!res.ok) {
        throw new Error(res.mensaje || "No se pudo actualizar el perfil");
      }

      setFotoActual(res.usuario.foto_perfil_url || "");
      setArchivo(null);
      setForm((prev) => ({ ...prev, password: "" }));
      setExito(true);
      setMensaje("Perfil actualizado correctamente");
    } catch (error) {
      setMensaje(error?.response?.data?.mensaje || error?.message || "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const fotoMostrada = previewFoto || fotoActual;
  const inputClass =
    "input-modern w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition";

  return (
    <div className="page-wrap">
      <main className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="glass-card overflow-hidden">
          <div className="bg-slate-900 p-7 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Cuenta Semi-Social
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Mi perfil</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Actualiza tu nombre, DPI y foto de perfil. La contrasena confirma que eres tu antes de guardar cambios.
            </p>
          </div>

          <div className="p-7">
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              <div className="relative">
                {fotoMostrada ? (
                  <img
                    src={fotoMostrada}
                    alt="Foto de perfil"
                    className="h-44 w-44 rounded-3xl object-cover shadow-lg ring-4 ring-white"
                  />
                ) : (
                  <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-600 text-6xl font-black text-white shadow-lg ring-4 ring-white">
                    {form.nombre_completo ? form.nombre_completo.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
                <span className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-md">
                  <Camera className="h-5 w-5" />
                </span>
              </div>

              <h2 className="mt-6 text-xl font-extrabold text-slate-900">
                {form.nombre_completo || "Tu perfil"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Esta foto tambien se usa para login facial.
              </p>

              <label className="btn-muted mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition">
                <ImagePlus className="h-4 w-4" />
                Cambiar foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                />
              </label>

              {archivo ? (
                <p className="mt-3 max-w-full truncate rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {archivo.name}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="glass-card p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
                Edicion de perfil
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Datos personales</h2>
              <p className="mt-1 text-sm text-slate-500">
                Se sincronizan con Cognito y se guardan en la base de datos.
              </p>
            </div>
            <Link
              to="/amigos"
              className="btn-muted inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700"
            >
              <Users className="h-4 w-4" />
              Ver amigos
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Nombre completo</span>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="nombre_completo"
                  placeholder="Ej. Maria Lopez"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">DPI</span>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="dpi"
                  placeholder="Ej. 1234567890101"
                  value={form.dpi}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">Contrasena actual</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Necesaria para guardar"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </label>

            {mensaje ? (
              <p
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  exito
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {exito ? <CheckCircle className="h-4 w-4" /> : null}
                {mensaje}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Perfil;
