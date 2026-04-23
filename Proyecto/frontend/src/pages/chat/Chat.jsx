import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import {
  enviarMensajeHttp,
  getChatWsUrl,
  listarChats,
  listarMensajes,
} from "../../services/chat/chat";

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

function Chat() {
  const [chats, setChats] = useState([]);
  const [chatActivo, setChatActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [draft, setDraft] = useState("");
  const [conectado, setConectado] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const cargarChats = async () => {
    const res = await listarChats();
    const lista = res.chats || [];
    setChats(lista);

    if (!chatActivo && lista.length > 0) {
      setChatActivo(lista[0]);
    }
  };

  useEffect(() => {
    cargarChats().catch(() => {});
  }, []);

  useEffect(() => {
    if (!chatActivo) {
      setMensajes([]);
      return;
    }

    listarMensajes(chatActivo.chat_id)
      .then((res) => setMensajes(res.mensajes || []))
      .catch(() => {});
  }, [chatActivo]);

  useEffect(() => {
    const ws = new WebSocket(getChatWsUrl());
    wsRef.current = ws;

    ws.onopen = () => setConectado(true);
    ws.onclose = () => setConectado(false);
    ws.onerror = () => {
      setConectado(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "mensaje") {
        setMensajes((prev) => {
          if (prev.some((mensaje) => mensaje.id === data.mensaje.id)) {
            return prev;
          }

          if (chatActivo && data.mensaje.chat_id !== chatActivo.chat_id) {
            return prev;
          }

          return [...prev, data.mensaje];
        });

        cargarChats().catch(() => {});
      }

      if (data.type === "error") {}
    };

    return () => ws.close();
  }, [chatActivo?.chat_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    const texto = draft.trim();

    if (!texto || !chatActivo) {
      return;
    }

    setDraft("");

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "mensaje",
          chatId: chatActivo.chat_id,
          mensaje: texto,
        })
      );
      return;
    }

    try {
      const res = await enviarMensajeHttp(chatActivo.chat_id, texto);
      setMensajes((prev) => [...prev, res.mensaje]);
      await cargarChats();
    } catch {
      setDraft(texto);
    }
  };

  return (
    <div className="page-wrap">
      <main className="mx-auto max-w-5xl space-y-6">
        <section className="grid min-h-[620px] gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="glass-card p-4">
            <h2 className="mb-3 text-lg font-extrabold text-slate-900">Amigos</h2>

            {chats.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center text-sm text-slate-500">
                Aun no tienes amigos con chat. Acepta solicitudes para crear conversaciones.
              </p>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat.chat_id}
                    type="button"
                    onClick={() => setChatActivo(chat)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      chatActivo?.chat_id === chat.chat_id
                        ? "border-cyan-200 bg-cyan-50"
                        : "border-slate-200 bg-white/80 hover:bg-slate-50"
                    }`}
                  >
                    <Avatar usuario={chat} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{chat.nombre_completo}</p>
                      <p className="truncate text-xs text-slate-500">
                        {chat.ultimo_mensaje || "Sin mensajes todavia"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <article className="glass-card flex min-h-[620px] flex-col overflow-hidden">
            {chatActivo ? (
              <>
                <header className="flex items-center gap-3 border-b border-slate-200 bg-white/70 p-4">
                  <Avatar usuario={chatActivo} />
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">{chatActivo.nombre_completo}</h2>
                    <p className="text-xs text-slate-500">@{chatActivo.username}</p>
                  </div>
                </header>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {mensajes.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-center text-sm text-slate-500">
                      No hay mensajes. Escribe el primero.
                    </p>
                  ) : (
                    mensajes.map((mensaje) => {
                      const esMio = mensaje.remitente_id !== chatActivo.amigo_id;

                      return (
                        <div
                          key={mensaje.id}
                          className={`flex ${esMio ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                              esMio
                                ? "bg-gradient-to-br from-cyan-600 to-teal-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <p>{mensaje.mensaje}</p>
                            <p className={`mt-1 text-[10px] ${esMio ? "text-cyan-50" : "text-slate-400"}`}>
                              {new Date(mensaje.fecha_envio).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleEnviar} className="flex gap-2 border-t border-slate-200 bg-white/80 p-4">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="input-modern flex-1 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  >
                    <Send className="h-4 w-4" />
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
                  <h2 className="mt-3 text-lg font-extrabold text-slate-900">Selecciona un amigo</h2>
                  <p className="mt-1 text-sm text-slate-500">Tus conversaciones apareceran aqui.</p>
                </div>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default Chat;
