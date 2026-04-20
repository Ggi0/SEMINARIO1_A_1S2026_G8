import { BrowserRouter, Routes } from "react-router-dom";
import { PublicRoutes } from "./publicaciones/publicaciones_routes";
import { HomeRoutes} from "./home_routes";
import Navbar from "../components/Navbar";

function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
  {HomeRoutes()}
  {PublicRoutes()}
</Routes>
    </BrowserRouter>
  );
}

export default AppRouter;