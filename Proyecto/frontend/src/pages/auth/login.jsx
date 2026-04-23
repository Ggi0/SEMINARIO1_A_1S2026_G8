import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Video, VideoOff, ScanFace, LogIn, Camera } from "lucide-react";
import { login, loginFacial } from "../../services/sesion/sesion";

const CAM_IDLE    = "idle";
const CAM_ACTIVE  = "active";
const CAM_LOADING = "loading";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm]                 = useState({ username: "", password: "" });
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError]               = useState("");
  const [tab, setTab]                   = useState("credentials");

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream]       = useState(null);
  const [camState, setCamState]   = useState(CAM_IDLE);
  const [facialMsg, setFacialMsg] = useState("");

  // ── Login normal ────────────────────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingLogin(true);
    try {
      const res = await login(form);
      if (res.ok) {
        localStorage.setItem("accessToken", res.accessToken);
        navigate("/publicaciones");
      } else {
        setError("Credenciales incorrectas. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setLoadingLogin(false);
    }
  };

  // ── Login facial ────────────────────────────────────────────────────────────
  const iniciarCamara = async () => {
    setCamState(CAM_LOADING);
    setFacialMsg("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCamState(CAM_ACTIVE);
    } catch {
      setFacialMsg("No se pudo acceder a la cámara.");
      setCamState(CAM_IDLE);
    }
  };

  const detenerCamara = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCamState(CAM_IDLE);
  };

  const capturarYLogin = async () => {
    setFacialMsg("");
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "foto.jpg", { type: "image/jpeg" });
      try {
        const res = await loginFacial(file);
        if (res.ok) {
          localStorage.setItem("accessToken", res.accessToken);
          navigate("/publicaciones");
        } else {
          setFacialMsg(res.mensaje ?? "No se reconoció el rostro.");
        }
      } catch {
        setFacialMsg("Error al procesar el reconocimiento facial.");
      }
    }, "image/jpeg");
  };

  // ── Clases reutilizables ────────────────────────────────────────────────────
  const inputClass =
    "input-modern w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition";

  const btnPrimary =
    "btn-brand w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

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
            <h1 className="text-xl font-semibold text-slate-900">Bienvenido</h1>
            <p className="mt-1 text-sm text-slate-500">Inicia sesion en tu cuenta</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            {[
              { key: "credentials", label: "Contraseña", icon: <Lock className="h-4 w-4" /> },
              { key: "facial",      label: "Facial",      icon: <ScanFace className="h-4 w-4" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setTab(key); setError(""); setFacialMsg(""); }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition ${
                  tab === key
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab: Contraseña ── */}
          {tab === "credentials" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Correo electronico
                </label>
                <input
                  type="email"
                  name="username"
                  placeholder="correo@ejemplo.com"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Contrasena
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loadingLogin} className={btnPrimary}>
                {loadingLogin ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Iniciando sesión…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Tab: Facial ── */}
          {tab === "facial" && (
            <div className="space-y-4">

              {/* Visor de cámara */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
                {camState !== CAM_ACTIVE && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Camera className="h-10 w-10 opacity-40" />
                    <span className="text-sm">
                      {camState === CAM_LOADING ? "Iniciando cámara…" : "Cámara apagada"}
                    </span>
                  </div>
                )}
              </div>

              {/* Canvas oculto */}
              <canvas ref={canvasRef} className="hidden" />

              {facialMsg && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {facialMsg}
                </p>
              )}

              {/* Botones */}
              {camState !== CAM_ACTIVE ? (
                <button
                  type="button"
                  onClick={iniciarCamara}
                  disabled={camState === CAM_LOADING}
                  className={btnPrimary}
                >
                  <Video className="h-4 w-4" />
                  {camState === CAM_LOADING ? "Iniciando…" : "Encender cámara"}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={detenerCamara}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
                  >
                    <VideoOff className="h-4 w-4" />
                    Apagar
                  </button>
                  <button
                    type="button"
                    onClick={capturarYLogin}
                    className="btn-brand flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition active:scale-95"
                  >
                    <ScanFace className="h-4 w-4" />
                    Capturar
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>No tienes cuenta?</span>
          <Link to="/registro" className="font-semibold text-cyan-700 hover:text-cyan-800">Registrate</Link>
          <span>·</span>
          <Link to="/confirmar-correo" className="font-semibold text-cyan-700 hover:text-cyan-800">Confirmar correo</Link>
        </div>
      </div>
    </div>
  );
}