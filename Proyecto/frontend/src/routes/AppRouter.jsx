import { BrowserRouter, Routes } from "react-router-dom";
import { PublicRoutes } from "./publicaciones/publicaciones_routes";
import { HomeRoutes} from "./home_routes";
import { SesionRoutes } from "./auth/sesion";
import { UsuariosRoutes } from "./usuarios/usuarios_routes";
import Navbar from "../components/Navbar";

function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
  {HomeRoutes()}
  {PublicRoutes()}
  {UsuariosRoutes()}
    {SesionRoutes()}
</Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
