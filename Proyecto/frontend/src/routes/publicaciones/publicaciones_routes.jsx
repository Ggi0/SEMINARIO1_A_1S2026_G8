import { Route } from "react-router-dom";
import Publicaciones from "../../pages/publicaciones/Publicaciones";

export const PublicRoutes = () => {
  return [
    <Route key="publicaciones" path="/publicaciones" element={<Publicaciones />} />
  ];
};