import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Images,
  ArrowRight,
  Users,
  WandSparkles,
  Languages,
  Shield,
  Image as ImageIcon,
  MessageSquare,
  CircleCheck,
  Brush,
} from "lucide-react";

function Home() {
  const feedDemo = [
    {
      usuario: "Ana M.",
      tiempo: "Hace 3 min",
      texto: "Subi nuevas fotos del evento de tecnologia.",
      color: "from-cyan-400 to-blue-500",
    },
    {
      usuario: "Carlos R.",
      tiempo: "Hace 11 min",
      texto: "Comunidad activa y comentarios en varios idiomas.",
      color: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <div className="page-wrap relative flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute -left-28 -top-24 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-16 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative w-full max-w-6xl space-y-7">
        <section className="glass-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6 p-8 md:p-11">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                <WandSparkles className="h-3.5 w-3.5" />
                Cloud Social
              </span>

              <div className="space-y-4">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
                  Convierte cada publicacion en una
                  <span className="block text-cyan-700">
                    experiencia que conecta personas
                  </span>
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
                  Registro rapido, login facial y publicaciones con traduccion automatica para que tu comunidad
                  crezca sin fronteras.
                </p>
              </div>

              <div className="grid gap-2 text-xs font-semibold text-slate-700 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-3">
                  <Shield className="mb-1 h-4 w-4 text-cyan-700" />
                  Seguridad en cada acceso
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-3">
                  <ImageIcon className="mb-1 h-4 w-4 text-cyan-700" />
                  Feed visual enfocado en imagen
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-3">
                  <Languages className="mb-1 h-4 w-4 text-cyan-700" />
                  Conversaciones sin barreras
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-300/40 transition hover:scale-[1.02]"
                >
                  Iniciar sesion
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/registro"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-700 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-900 shadow-lg shadow-slate-400/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 p-7 md:p-9">
              <div className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-800/75 p-5 text-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
                    Vista previa del feed
                  </p>
                  <CircleCheck className="h-4 w-4 text-cyan-300" />
                </div>

                <div className="space-y-3">
                  {feedDemo.map((item) => (
                    <article key={item.usuario} className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-xs font-bold text-white`}>
                            {item.usuario.charAt(0)}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-100">{item.usuario}</p>
                            <p className="text-[10px] text-slate-400">{item.tiempo}</p>
                          </div>
                        </div>
                        <MessageSquare className="h-3.5 w-3.5 text-cyan-300" />
                      </div>

                      <div className={`mb-2 h-24 rounded-lg bg-gradient-to-r ${item.color} opacity-90`} />

                      <p className="text-xs text-slate-300">{item.texto}</p>
                    </article>
                  ))}
                </div>

                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-xs text-cyan-100">
                  Asi se veran las publicaciones de tus usuarios, con imagenes, comentarios y traduccion.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <article className="glass-card border-emerald-200/90 bg-emerald-50/55 p-6">
            <ShieldCheck className="mb-3 h-7 w-7 text-emerald-700" />
            <h2 className="text-base font-semibold text-slate-900">Seguridad de confianza</h2>
            <p className="mt-2 text-sm text-slate-600">Autenticacion tradicional y facial en un flujo unificado para proteger cada cuenta.</p>
          </article>
          <article className="glass-card border-cyan-200/90 bg-cyan-50/55 p-6">
            <Images className="mb-3 h-7 w-7 text-cyan-700" />
            <h2 className="text-base font-semibold text-slate-900">Feed dinamico</h2>
            <p className="mt-2 text-sm text-slate-600">Publica contenido visual, comenta en tiempo real y aumenta la participacion.</p>
          </article>
          <article className="glass-card border-violet-200/90 bg-violet-50/55 p-6">
            <Brush className="mb-3 h-7 w-7 text-violet-700" />
            <h2 className="text-base font-semibold text-slate-900">Experiencia memorable</h2>
            <p className="mt-2 text-sm text-slate-600">Una interfaz moderna que invita a explorar, interactuar y volver.</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-3xl bg-slate-900 px-6 py-9 shadow-xl md:px-10 md:py-12">
          <div className="flex min-h-32 flex-col items-center justify-center text-center">
            <h3 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">Cloud Social</h3>
            <p className="mt-6 text-sm font-medium text-slate-300 md:text-base">Seminario de Sistemas 1 - Grupo 8</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;