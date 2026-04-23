import { useEffect, useState } from "react";
import {
  aceptarSolicitud,
  enviarSolicitud,
  listarAmigos,
  listarSolicitudesEnviadas,
  listarSolicitudesRecibidas,
  listarUsuariosDisponibles,
  rechazarSolicitud,
} from "../../services/usuarios/amistades";
import "./Amigos.css";

function Avatar({ usuario }) {
  const inicial = usuario?.nombre_completo?.charAt(0)?.toUpperCase() || "U";

  if (usuario?.foto_perfil_url) {
    return <img className="amigos-avatar" src={usuario.foto_perfil_url} alt={usuario.nombre_completo} />;
  }

  return <span className="amigos-avatar amigos-avatar-empty">{inicial}</span>;
}

function EmptyState({ texto }) {
  return <p className="amigos-empty">{texto}</p>;
}

function Amigos() {
  const [usuarios, setUsuarios] = useState([]);
  const [recibidas, setRecibidas] = useState([]);
  const [enviadas, setEnviadas] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const cargarDatos = async () => {
    const [usuariosRes, recibidasRes, enviadasRes, amigosRes] = await Promise.all([
      listarUsuariosDisponibles(),
      listarSolicitudesRecibidas(),
      listarSolicitudesEnviadas(),
      listarAmigos(),
    ]);

    setUsuarios(usuariosRes.usuarios || []);
    setRecibidas(recibidasRes.solicitudes || []);
    setEnviadas(enviadasRes.solicitudes || []);
    setAmigos(amigosRes.amigos || []);
  };

  useEffect(() => {
    setLoading(true);
    cargarDatos()
      .catch(() => setMensaje("Inicia sesion para gestionar tus amigos"))
      .finally(() => setLoading(false));
  }, []);

  const ejecutarAccion = async (accion, mensajeExito) => {
    try {
      setLoading(true);
      setMensaje("");
      const res = await accion();

      if (!res.ok) {
        throw new Error(res.mensaje || "No se pudo completar la accion");
      }

      setMensaje(res.mensaje || mensajeExito);
      await cargarDatos();
    } catch (error) {
      setMensaje(error?.response?.data?.mensaje || error?.message || "No se pudo completar la accion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="amigos-page">
      <section className="amigos-hero">
        <p className="amigos-eyebrow">Usuarios y amigos</p>
        <h1>Solicitudes de amistad</h1>
        <p>
          Encuentra usuarios, envia solicitudes y responde invitaciones como en una red social.
          Cuando aceptas una solicitud, tambien se prepara el chat entre ambos.
        </p>
      </section>

      {mensaje ? <p className="amigos-message">{mensaje}</p> : null}

      <section className="amigos-grid">
        <article className="amigos-panel amigos-panel-wide">
          <div className="amigos-panel-header">
            <h2>Usuarios disponibles</h2>
            <span>{usuarios.length}</span>
          </div>

          {usuarios.length === 0 ? (
            <EmptyState texto={loading ? "Cargando usuarios..." : "No hay usuarios disponibles por ahora."} />
          ) : (
            <div className="amigos-list">
              {usuarios.map((usuario) => (
                <div className="amigos-user-card" key={usuario.id}>
                  <Avatar usuario={usuario} />
                  <div>
                    <strong>{usuario.nombre_completo}</strong>
                    <span>@{usuario.username}</span>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      ejecutarAccion(
                        () => enviarSolicitud(usuario.id),
                        "Solicitud enviada correctamente"
                      )
                    }
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="amigos-panel">
          <div className="amigos-panel-header">
            <h2>Recibidas</h2>
            <span>{recibidas.length}</span>
          </div>

          {recibidas.length === 0 ? (
            <EmptyState texto="No tienes solicitudes pendientes." />
          ) : (
            <div className="amigos-stack">
              {recibidas.map((solicitud) => (
                <div className="amigos-request" key={solicitud.id}>
                  <Avatar usuario={solicitud} />
                  <div>
                    <strong>{solicitud.nombre_completo}</strong>
                    <span>@{solicitud.username}</span>
                  </div>
                  <div className="amigos-request-actions">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        ejecutarAccion(
                          () => aceptarSolicitud(solicitud.id),
                          "Solicitud aceptada"
                        )
                      }
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      className="amigos-button-muted"
                      disabled={loading}
                      onClick={() =>
                        ejecutarAccion(
                          () => rechazarSolicitud(solicitud.id),
                          "Solicitud rechazada"
                        )
                      }
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="amigos-panel">
          <div className="amigos-panel-header">
            <h2>Enviadas</h2>
            <span>{enviadas.length}</span>
          </div>

          {enviadas.length === 0 ? (
            <EmptyState texto="Aun no has enviado solicitudes." />
          ) : (
            <div className="amigos-stack">
              {enviadas.map((solicitud) => (
                <div className="amigos-mini-row" key={solicitud.id}>
                  <Avatar usuario={solicitud} />
                  <div>
                    <strong>{solicitud.nombre_completo}</strong>
                    <span className={`amigos-status amigos-status-${solicitud.estado}`}>
                      {solicitud.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="amigos-panel amigos-panel-wide">
          <div className="amigos-panel-header">
            <h2>Mis amigos</h2>
            <span>{amigos.length}</span>
          </div>

          {amigos.length === 0 ? (
            <EmptyState texto="Aun no tienes amigos agregados." />
          ) : (
            <div className="amigos-list">
              {amigos.map((amigo) => (
                <div className="amigos-user-card amigos-user-card-soft" key={amigo.id}>
                  <Avatar usuario={amigo} />
                  <div>
                    <strong>{amigo.nombre_completo}</strong>
                    <span>Chat #{amigo.chat_id || "pendiente"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default Amigos;
