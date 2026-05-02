// Componente de chatbot flotante
// Uso: importa <ChatBot /> en cualquier page y se renderiza como botón fijo

import { useState, useEffect, useRef } from 'react';
import { enviarMensajeChat } from '../services/usuarios/chat-bot_ser';

// sessionId estable por pestaña (se regenera al recargar la página)
const SESSION_ID = `sesion-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const ChatBot = () => {
  const [abierto, setAbierto]     = useState(false);
  const [mensaje, setMensaje]     = useState('');
  const [cargando, setCargando]   = useState(false);
  const [historial, setHistorial] = useState([
    { emisor: 'bot', texto: '¡Hola! Soy tu asistente virtual. ¿En qué te puedo ayudar?' },
  ]);

  // Referencia al contenedor de mensajes para hacer scroll automático
  const bottomRef = useRef(null);

  // Cada vez que llega un mensaje nuevo, hacemos scroll al final
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [historial]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() || cargando) return;

    const textoUsuario = mensaje.trim();

    // Agregar el mensaje del usuario al historial de inmediato
    const historialConUsuario = [
      ...historial,
      { emisor: 'usuario', texto: textoUsuario },
    ];
    setHistorial(historialConUsuario);
    setMensaje('');
    setCargando(true);

    try {
      const data = await enviarMensajeChat(textoUsuario, SESSION_ID);

      if (data.ok && data.mensajes) {
        // Lex puede devolver varios mensajes consecutivos
        const respuestasBot = data.mensajes.map((txt) => ({ emisor: 'bot', texto: txt }));
        setHistorial([...historialConUsuario, ...respuestasBot]);
      } else {
        setHistorial([
          ...historialConUsuario,
          { emisor: 'bot', texto: data.mensaje || 'Hubo un problema con el asistente.' },
        ]);
      }
    } catch {
      setHistorial([
        ...historialConUsuario,
        { emisor: 'bot', texto: 'Error de conexión. Intenta de nuevo.' },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {/* Botón flotante para abrir/cerrar el chat */}
      <button
        onClick={() => setAbierto((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          fontSize: '22px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(37,99,235,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title={abierto ? 'Cerrar chat' : 'Abrir asistente'}
      >
        {abierto ? '✕' : '💬'}
      </button>

      {/* Ventana del chat */}
      {abierto && (
        <div
          style={{
            position: 'fixed',
            bottom: '92px',
            right: '24px',
            width: '320px',
            height: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Cabecera */}
          <div
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 16px',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🤖</span>
            <span>Asistente Virtual</span>
          </div>

          {/* Historial de mensajes */}
          <div
            style={{
              flex: 1,
              padding: '12px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: '#f9fafb',
            }}
          >
            {historial.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.emisor === 'usuario' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.emisor === 'usuario' ? '#2563eb' : '#ffffff',
                  color: msg.emisor === 'usuario' ? '#ffffff' : '#111827',
                  padding: '8px 12px',
                  borderRadius: msg.emisor === 'usuario'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                  maxWidth: '78%',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                  border: msg.emisor === 'bot' ? '1px solid #e5e7eb' : 'none',
                }}
              >
                {msg.texto}
              </div>
            ))}

            {/* Indicador de "escribiendo..." mientras espera respuesta */}
            {cargando && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#ffffff',
                  color: '#6b7280',
                  padding: '8px 14px',
                  borderRadius: '12px 12px 12px 2px',
                  fontSize: '13px',
                  border: '1px solid #e5e7eb',
                  fontStyle: 'italic',
                }}
              >
                Escribiendo...
              </div>
            )}

            {/* Ancla para el scroll automático */}
            <div ref={bottomRef} />
          </div>

          {/* Campo de entrada */}
          <form
            onSubmit={enviar}
            style={{
              display: 'flex',
              borderTop: '1px solid #e5e7eb',
              padding: '10px',
              gap: '8px',
              backgroundColor: '#ffffff',
            }}
          >
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={cargando}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '13px',
                backgroundColor: cargando ? '#f3f4f6' : '#ffffff',
              }}
            />
            <button
              type="submit"
              disabled={cargando || !mensaje.trim()}
              style={{
                padding: '8px 14px',
                backgroundColor: cargando || !mensaje.trim() ? '#93c5fd' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: cargando || !mensaje.trim() ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'background-color 0.2s',
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;