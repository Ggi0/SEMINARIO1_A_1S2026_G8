import { BrowserRouter, Routes } from "react-router-dom";
import { PublicRoutes } from "./publicaciones/publicaciones_routes";
import { HomeRoutes} from "./home_routes";
import { SesionRoutes } from "./auth/sesion";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
  {HomeRoutes()}
  {PublicRoutes()}
    {SesionRoutes()}
</Routes>
    </BrowserRouter>
  );
}

export default AppRouter;