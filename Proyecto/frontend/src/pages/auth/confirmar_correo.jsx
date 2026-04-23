import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { confirmarCorreo } from "../../services/sesion/sesion";
import { Mail, KeyRound, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function ConfirmarCorreo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", codigo: "" });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setExito(false);
    setLoading(true);

    try {
      const res = await confirmarCorreo(form);
      console.log(res);

      if (res.ok) {
        setExito(true);
        setMensaje("¡Correo confirmado! Redirigiendo al login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMensaje(res?.mensaje || "Código incorrecto. Intenta de nuevo.");
      }
    } catch {
      setMensaje("Error de conexión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "input-modern w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition";

  return (
    <div className="page-wrap flex items-center justify-center">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="glass-card p-8">

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Confirmar correo</h1>
            <p className="mt-1 text-sm text-gray-500">
              Ingresa el código que enviamos a tu correo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Correo */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="username"
                type="email"
                placeholder="Correo electrónico"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            {/* Código */}
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="codigo"
                type="text"
                placeholder="Código de verificación"
                value={form.codigo}
                onChange={handleChange}
                required
                className={inputClass}
              />
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
              disabled={loading || exito}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar correo"
              )}
            </button>

          </form>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Te falta cuenta?</span>
          <Link to="/registro" className="font-semibold text-cyan-700 hover:text-cyan-800">Registrate</Link>
          <span>·</span>
          <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">Iniciar sesion</Link>
        </div>
      </div>
    </div>
  );
}

export default ConfirmarCorreo;