import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Images, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { getApiStatus } from "../services/api_servicio";

function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getApiStatus()
      .then(setData)
      .catch(() => setError("No se pudo consultar el estado del backend"));
  }, []);

  return (
    <div className="page-wrap flex items-center justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <section className="glass-card overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="space-y-5 p-8 md:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Plataforma social cloud
              </span>

              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Comparte publicaciones con un frontend mas moderno
                </h1>
                <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                  Administra registro, login facial y feed de publicaciones con un flujo mas limpio y visual.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/login"
                  className="btn-brand inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  Iniciar sesion
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/registro"
                  className="btn-muted inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition"
                >
                  Crear cuenta
                </Link>
                <Link
                  to="/publicaciones"
                  className="btn-muted inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition"
                >
                  Ir al feed
                </Link>
              </div>
            </div>

            <div className="flex items-center bg-slate-900 p-8 md:p-10">
              <div className="w-full space-y-4 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
                  Estado del API
                </p>

                {error ? (
                  <p className="inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    <WifiOff className="h-4 w-4" />
                    {error}
                  </p>
                ) : (
                  <p className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    <Wifi className="h-4 w-4" />
                    {data ? "Conectado" : "Consultando..."}
                  </p>
                )}

                <pre className="max-h-56 overflow-auto rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-300">
                  {JSON.stringify(data || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <article className="glass-card p-4">
            <ShieldCheck className="mb-2 h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">Seguridad</h2>
            <p className="mt-1 text-xs text-slate-600">Autenticacion tradicional y facial en un mismo flujo.</p>
          </article>
          <article className="glass-card p-4">
            <Images className="mb-2 h-5 w-5 text-sky-600" />
            <h2 className="text-sm font-semibold text-slate-900">Publicaciones</h2>
            <p className="mt-1 text-xs text-slate-600">Sube imagenes, comenta y traduce contenido en tiempo real.</p>
          </article>
          <article className="glass-card p-4">
            <Sparkles className="mb-2 h-5 w-5 text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-900">Experiencia</h2>
            <p className="mt-1 text-xs text-slate-600">Interfaz visual mas limpia y consistente en todas las paginas.</p>
          </article>
        </section>
      </div>
    </div>
  );
}

export default Home;