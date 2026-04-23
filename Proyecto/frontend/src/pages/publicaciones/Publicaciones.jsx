import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  crearComentario,
  crearPublicacion,
  getEtiquetas,
  getPublicaciones,
  subirImagenPublicacion,
  traducirTexto,
} from "../../services/publicaciones/publicaciones";
import {
  ImagePlus,
  Search,
  Globe,
  Send,
  Languages,
  Tag,
  MessageCircle,
  Loader2,
  X,
  LogOut,
  House,
} from "lucide-react";

const IDIOMAS = [
  { code: "es", label: "Español" },
  { code: "en", label: "Inglés" },
  { code: "fr", label: "Francés" },
  { code: "pt", label: "Portugués" },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Publicaciones() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [etiquetas, setEtiquetas] = useState(["todos"]);
  const [buscador, setBuscador] = useState("");
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState("todos");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [comentariosDraft, setComentariosDraft] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [idiomaDestino, setIdiomaDestino] = useState("en");
  const [traducciones, setTraducciones] = useState({});

  const filtros = useMemo(() => {
    const base =
      etiquetaSeleccionada && etiquetaSeleccionada !== "todos"
        ? { etiqueta: etiquetaSeleccionada }
        : {};
    return buscador.trim() ? { ...base, buscar: buscador.trim() } : base;
  }, [buscador, etiquetaSeleccionada]);

  const cargarFeed = async () => {
    const res = await getPublicaciones(filtros);
    setData(res.publicaciones || []);
  };

  const cargarEtiquetas = async () => {
    const res = await getEtiquetas(buscador.trim());
    setEtiquetas(res.etiquetas || ["todos"]);
  };

  useEffect(() => {
    cargarFeed().catch(console.error);
    cargarEtiquetas().catch(console.error);
  }, [buscador, etiquetaSeleccionada]);

  const handleArchivo = (e) => {
    const file = e.target.files?.[0] || null;
    setArchivo(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCrearPublicacion = async (e) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje("Debes seleccionar una imagen");
      return;
    }
    try {
      setLoading(true);
      setMensaje("Subiendo imagen...");
      const base64 = await fileToBase64(archivo);
      const uploadRes = await subirImagenPublicacion(base64, archivo);
      if (!uploadRes.ok || !uploadRes.url || !uploadRes.key) {
        throw new Error(uploadRes.error || "No se pudo subir la imagen");
      }
      setMensaje("Creando publicación...");
      await crearPublicacion({
        imagen_url: uploadRes.url,
        imagen_s3_key: uploadRes.key,
        descripcion: descripcion.trim() || null,
      });
      setDescripcion("");
      setArchivo(null);
      setPreview(null);
      setMensaje("✓ Publicación creada correctamente");
      await cargarFeed();
      await cargarEtiquetas();
    } catch (error) {
      setMensaje(error?.message || "Error al crear publicación");
    } finally {
      setLoading(false);
    }
  };

  const handleComentar = async (publicacionId) => {
    const texto = (comentariosDraft[publicacionId] || "").trim();
    if (!texto) return;
    try {
      await crearComentario(publicacionId, texto);
      setComentariosDraft((prev) => ({ ...prev, [publicacionId]: "" }));
      await cargarFeed();
    } catch (error) {
      setMensaje(error?.message || "No se pudo crear el comentario");
    }
  };

  const handleTraducir = async (key, textoOriginal) => {
    try {
      const res = await traducirTexto(textoOriginal, idiomaDestino);
      setTraducciones((prev) => ({
        ...prev,
        [key]: res?.traduccion?.textoTraducido || "",
      }));
    } catch (error) {
      setMensaje(error?.message || "No se pudo traducir");
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  };

  // ── Clases reutilizables ────────────────────────────────────────────────────
  const inputClass =
    "input-modern w-full rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition";

  return (
    <div className="page-wrap">

      {/* ── Navbar ── */}
      <header className="sticky top-3 z-10 mx-auto max-w-3xl rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="btn-muted inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <House className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Social Feed</h1>
          </div>
          {/* Selector de idioma y cierre de sesión */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <select
              value={idiomaDestino}
              onChange={(e) => setIdiomaDestino(e.target.value)}
              className="input-modern rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none"
            >
              {IDIOMAS.map((idioma) => (
                <option key={idioma.code} value={idioma.code}>
                  {idioma.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCerrarSesion}
              className="btn-muted inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-700 transition"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">

        {/* ── Crear publicación ── */}
        <section className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Nueva publicación
          </h2>
          <form onSubmit={handleCrearPublicacion} className="space-y-3">

            {/* Preview imagen */}
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-48 w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setArchivo(null); setPreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-blue-400 hover:text-blue-500">
                <ImagePlus className="h-7 w-7" />
                <span className="text-sm">Seleccionar imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleArchivo}
                />
              </label>
            )}

            <input
              type="text"
              placeholder="Descripción opcional..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputClass}
            />

            {mensaje && (
              <p className={`text-sm ${mensaje.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  Publicar
                </>
              )}
            </button>
          </form>
        </section>

        {/* ── Filtros ── */}
        <section className="glass-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={buscador}
                onChange={(e) => setBuscador(e.target.value)}
                className="input-modern w-full rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
              />
            </div>
            {/* Etiquetas */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={etiquetaSeleccionada}
                onChange={(e) => setEtiquetaSeleccionada(e.target.value)}
                className="input-modern rounded-lg py-2 pl-9 pr-4 text-sm text-gray-700 outline-none"
              >
                {etiquetas.map((etiqueta) => (
                  <option key={etiqueta} value={etiqueta}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Feed ── */}
        <div className="space-y-5">
          {data.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">No hay publicaciones.</p>
          )}
          {data.map((publicacion) => (
            <article
              key={publicacion.id}
              className="glass-card overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                  {publicacion.nombre_completo?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {publicacion.nombre_completo}
                  </p>
                  <p className="text-xs text-gray-400">@{publicacion.username}</p>
                </div>
              </div>

              {/* Imagen */}
              <img
                src={publicacion.imagen_url}
                alt={`Publicación ${publicacion.id}`}
                className="w-full object-cover max-h-96"
              />

              {/* Descripción */}
              <div className="px-5 pt-4 space-y-2">
                <p className="text-sm text-gray-700">
                  {publicacion.descripcion || (
                    <span className="italic text-gray-400">Sin descripción</span>
                  )}
                </p>

                {/* Traducción descripción */}
                {publicacion.descripcion && (
                  <button
                    type="button"
                    onClick={() => handleTraducir(`publi-${publicacion.id}`, publicacion.descripcion)}
                    className="flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 transition"
                  >
                    <Languages className="h-3.5 w-3.5" />
                    Traducir descripción
                  </button>
                )}
                {traducciones[`publi-${publicacion.id}`] && (
                  <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 border border-blue-100">
                    {traducciones[`publi-${publicacion.id}`]}
                  </p>
                )}

                {/* Etiquetas */}
                {(publicacion.etiquetas || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {publicacion.etiquetas.map((etq) => (
                      <span
                        key={etq}
                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                      >
                        #{etq}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comentarios */}
              <div className="px-5 py-4 space-y-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Comentarios
                </p>

                {(publicacion.comentarios || []).length === 0 && (
                  <p className="text-xs text-gray-400">Sin comentarios aún.</p>
                )}

                {(publicacion.comentarios || []).map((comentario) => (
                  <div key={comentario.id} className="space-y-1">
                    <div className="rounded-xl bg-gray-50 px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700">
                        {comentario.nombre_completo}
                      </p>
                      <p className="text-sm text-gray-600">{comentario.comentario}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTraducir(`com-${comentario.id}`, comentario.comentario)}
                      className="flex items-center gap-1 pl-1 text-xs text-blue-400 hover:text-blue-600 transition"
                    >
                      <Languages className="h-3 w-3" />
                      Traducir
                    </button>
                    {traducciones[`com-${comentario.id}`] && (
                      <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 border border-blue-100">
                        {traducciones[`com-${comentario.id}`]}
                      </p>
                    )}
                  </div>
                ))}

                {/* Input comentario */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={comentariosDraft[publicacion.id] || ""}
                    onChange={(e) =>
                      setComentariosDraft((prev) => ({
                        ...prev,
                        [publicacion.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleComentar(publicacion.id)}
                    className="input-modern flex-1 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleComentar(publicacion.id)}
                    className="btn-brand flex items-center justify-center rounded-lg px-3 py-2 text-white transition active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Publicaciones;