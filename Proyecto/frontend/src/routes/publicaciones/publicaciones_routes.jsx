import { Route } from "react-router-dom";
import Publicaciones from "../../pages/publicaciones/Publicaciones";
import PrivateRoute from "../PrivateRoute";

export const PublicRoutes = () => {
  return [
    <Route
      key="publicaciones"
      path="/publicaciones"
      element={
        <PrivateRoute>
          <Publicaciones />
        </PrivateRoute>
      }
    />
  ];
};
