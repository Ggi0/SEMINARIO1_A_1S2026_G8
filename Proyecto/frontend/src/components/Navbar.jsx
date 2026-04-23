import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Images, LogOut, MessageCircle, UserPlus, UserRound } from "lucide-react";

const navItems = [
  { to: "/publicaciones", label: "Feed", icon: Images },
  { to: "/amigos", label: "Solicitudes", icon: UserPlus },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/perfil", label: "Perfil", icon: UserRound },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));

  useEffect(() => {
    const actualizarSesion = () => setToken(localStorage.getItem("accessToken"));
    actualizarSesion();
    window.addEventListener("auth-change", actualizarSesion);
    return () => window.removeEventListener("auth-change", actualizarSesion);
  }, [location.pathname]);

  const cerrarSesion = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to={token ? "/publicaciones" : "/login"} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-sm font-black text-white shadow-sm">
            SS
          </span>
          <div>
            <p className="text-sm font-extrabold leading-none text-slate-900">Semi-Social</p>
            <p className="text-[11px] font-medium text-slate-500">Red social cloud</p>
          </div>
        </Link>

        {token ? (
          <div className="flex flex-wrap gap-2 sm:justify-center">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        ) : (
          <p className="hidden text-xs font-semibold text-slate-500 sm:block">
            Inicia sesion para acceder al feed social
          </p>
        )}

        <div className="flex gap-2">
          {token ? (
            <button
              type="button"
              onClick={cerrarSesion}
              className="btn-muted inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`btn-muted rounded-xl px-3 py-2 text-xs font-bold text-slate-700 ${
                  location.pathname === "/login" ? "ring-1 ring-cyan-100" : ""
                }`}
              >
                Login
              </Link>
              <Link
                to="/registro"
                className="btn-brand rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm"
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
