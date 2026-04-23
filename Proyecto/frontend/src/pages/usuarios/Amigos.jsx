import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock, MessageCircle, UserRound, UserRoundPlus, Users, X } from "lucide-react";
import {
  aceptarSolicitud,
  enviarSolicitud,
  listarAmigos,
  listarSolicitudesEnviadas,
  listarSolicitudesRecibidas,
  listarUsuariosDisponibles,
  rechazarSolicitud,
} from "../../services/usuarios/amistades";

function Avatar({ usuario }) {
  const inicial = usuario?.nombre_completo?.charAt(0)?.toUpperCase() || "U";

  if (usuario?.foto_perfil_url) {
    return (
      <img
        className="h-11 w-11 rounded-2xl object-cover"
        src={usuario.foto_perfil_url}
        alt={usuario.nombre_completo}
      />
    );
  }

  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-sm font-black text-white">
      {inicial}
    </span>
  );
}

function EmptyState({ texto }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center text-sm text-slate-500">
      {texto}
    </p>
  );
}

function UserCard({ usuario, action }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <Avatar usuario={usuario} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{usuario.nombre_completo}</p>
        <p className="truncate text-xs text-slate-500">@{usuario.username}</p>
      </div>
      {action}
    </div>
  );
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
    <div className="page-wrap">
      <main className="mx-auto max-w-5xl space-y-6">
        <section className="glass-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1fr_0.8fr]">
            <div className="p-7 md:p-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">
                <Users className="h-3.5 w-3.5" />
                Usuarios y amigos
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Gestiona tus solicitudes de amistad
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Primero envia o responde solicitudes. Cuando una solicitud se acepta,
                el usuario pasa a tu lista de amigos y queda listo para aparecer en el chat.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/perfil"
                  className="btn-muted inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700"
                >
                  <UserRound className="h-4 w-4" />
                  Ver perfil
                </Link>
                <Link
                  to="/publicaciones"
                  className="btn-brand inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                >
                  Ir al feed
                </Link>
              </div>
            </div>

            <div className="flex items-center bg-slate-900 p-7 text-white md:p-8">
              <div className="grid w-full grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-center">
                  <p className="text-2xl font-black text-cyan-300">{usuarios.length}</p>
                  <p className="mt-1 text-xs text-slate-300">Disponibles</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-center">
                  <p className="text-2xl font-black text-amber-300">{recibidas.length}</p>
                  <p className="mt-1 text-xs text-slate-300">Recibidas</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 text-center">
                  <p className="text-2xl font-black text-emerald-300">{amigos.length}</p>
                  <p className="mt-1 text-xs text-slate-300">Amigos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {mensaje ? (
          <p className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
            {mensaje}
          </p>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="glass-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Usuarios disponibles</h2>
                <p className="text-sm text-slate-500">Personas que aun no son tus amigos.</p>
              </div>
              <span className="rounded-xl bg-cyan-50 px-3 py-1 text-sm font-black text-cyan-700">
                {usuarios.length}
              </span>
            </div>

            {usuarios.length === 0 ? (
              <EmptyState texto={loading ? "Cargando usuarios..." : "No hay usuarios disponibles por ahora."} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {usuarios.map((usuario) => (
                  <UserCard
                    key={usuario.id}
                    usuario={usuario}
                    action={
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          ejecutarAccion(
                            () => enviarSolicitud(usuario.id),
                            "Solicitud enviada correctamente"
                          )
                        }
                        className="btn-brand inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <UserRoundPlus className="h-4 w-4" />
                        Agregar
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </article>

          <article className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Solicitudes recibidas</h2>
                <p className="text-sm text-slate-500">Acepta o rechaza invitaciones.</p>
              </div>
              <span className="rounded-xl bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
                {recibidas.length}
              </span>
            </div>

            {recibidas.length === 0 ? (
              <EmptyState texto="No tienes solicitudes pendientes." />
            ) : (
              <div className="space-y-3">
                {recibidas.map((solicitud) => (
                  <div key={solicitud.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <UserCard usuario={solicitud} />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          ejecutarAccion(
                            () => aceptarSolicitud(solicitud.id),
                            "Solicitud aceptada"
                          )
                        }
                        className="btn-brand inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />
                        Aceptar
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          ejecutarAccion(
                            () => rechazarSolicitud(solicitud.id),
                            "Solicitud rechazada"
                          )
                        }
                        className="btn-muted inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Solicitudes enviadas</h2>
                <p className="text-sm text-slate-500">Estado de tus invitaciones.</p>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                {enviadas.length}
              </span>
            </div>

            {enviadas.length === 0 ? (
              <EmptyState texto="Aun no has enviado solicitudes." />
            ) : (
              <div className="space-y-3">
                {enviadas.map((solicitud) => (
                  <UserCard
                    key={solicitud.id}
                    usuario={solicitud}
                    action={
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black uppercase text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        {solicitud.estado}
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </article>

          <article className="glass-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Mis amigos</h2>
                <p className="text-sm text-slate-500">Estos usuarios seran los que aparezcan en el chat.</p>
              </div>
              <span className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                {amigos.length}
              </span>
            </div>

            {amigos.length === 0 ? (
              <EmptyState texto="Aun no tienes amigos agregados." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {amigos.map((amigo) => (
                  <UserCard
                    key={amigo.id}
                    usuario={amigo}
                    action={
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Chat #{amigo.chat_id || "pendiente"}
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default Amigos;
