import { useEffect, useMemo, useState } from "react";
import {
  crearComentario,
  crearPublicacion,
  getEtiquetas,
  getPublicaciones,
  subirImagenPublicacion,
  traducirTexto,
} from "../../services/publicaciones/publicaciones";

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
  const [data, setData] = useState([]);
  const [etiquetas, setEtiquetas] = useState(["todos"]);
  const [buscador, setBuscador] = useState("");
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState("todos");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [comentariosDraft, setComentariosDraft] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [idiomaDestino, setIdiomaDestino] = useState("en");
  const [traducciones, setTraducciones] = useState({});

  const filtros = useMemo(() => {
    const base = etiquetaSeleccionada && etiquetaSeleccionada !== "todos"
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
      setMensaje("Publicación creada correctamente");
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
    if (!texto) {
      return;
    }

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

  return (
    <div>
      <h1>Publicaciones</h1>

      <h2>Crear publicación</h2>
      <form onSubmit={handleCrearPublicacion}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
        />
        <input
          type="text"
          placeholder="Descripción opcional"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Publicar"}
        </button>
      </form>

      <h2>Filtros</h2>
      <input
        type="text"
        placeholder="Buscar etiqueta"
        value={buscador}
        onChange={(e) => setBuscador(e.target.value)}
      />
      <select
        value={etiquetaSeleccionada}
        onChange={(e) => setEtiquetaSeleccionada(e.target.value)}
      >
        {etiquetas.map((etiqueta) => (
          <option key={etiqueta} value={etiqueta}>
            {etiqueta}
          </option>
        ))}
      </select>

      <h2>Idioma de traducción</h2>
      <select value={idiomaDestino} onChange={(e) => setIdiomaDestino(e.target.value)}>
        {IDIOMAS.map((idioma) => (
          <option key={idioma.code} value={idioma.code}>
            {idioma.label}
          </option>
        ))}
      </select>

      {mensaje ? <p>{mensaje}</p> : null}

      <hr />
      {data.map((publicacion) => (
        <article key={publicacion.id} style={{ marginBottom: "2rem" }}>
          <h3>
            {publicacion.nombre_completo} (@{publicacion.username})
          </h3>
          <img
            src={publicacion.imagen_url}
            alt={`Publicación ${publicacion.id}`}
            style={{ maxWidth: "360px", display: "block" }}
          />

          <p>
            <strong>Descripción:</strong> {publicacion.descripcion || "Sin descripción"}
          </p>
          <button
            type="button"
            onClick={() => handleTraducir(`publi-${publicacion.id}`, publicacion.descripcion || "")}
            disabled={!publicacion.descripcion}
          >
            Traducir descripción
          </button>
          {traducciones[`publi-${publicacion.id}`] ? (
            <p><strong>Traducción:</strong> {traducciones[`publi-${publicacion.id}`]}</p>
          ) : null}

          <p>
            <strong>Etiquetas:</strong> {(publicacion.etiquetas || []).join(", ") || "Sin etiquetas"}
          </p>

          <h4>Comentarios</h4>
          {(publicacion.comentarios || []).map((comentario) => (
            <div key={comentario.id}>
              <p>
                <strong>{comentario.nombre_completo}:</strong> {comentario.comentario}
              </p>
              <button
                type="button"
                onClick={() => handleTraducir(`com-${comentario.id}`, comentario.comentario)}
              >
                Traducir comentario
              </button>
              {traducciones[`com-${comentario.id}`] ? (
                <p><strong>Traducción:</strong> {traducciones[`com-${comentario.id}`]}</p>
              ) : null}
            </div>
          ))}

          <input
            type="text"
            placeholder="Escribe un comentario"
            value={comentariosDraft[publicacion.id] || ""}
            onChange={(e) =>
              setComentariosDraft((prev) => ({
                ...prev,
                [publicacion.id]: e.target.value,
              }))
            }
          />
          <button type="button" onClick={() => handleComentar(publicacion.id)}>
            Comentar
          </button>
        </article>
      ))}
    </div>
  );
}

export default Publicaciones;