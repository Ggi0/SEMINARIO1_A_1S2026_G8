import { Route } from "react-router-dom";
import Amigos from "../../pages/usuarios/Amigos";
import Chat from "../../pages/chat/Chat";
import Perfil from "../../pages/usuarios/Perfil";
import PrivateRoute from "../PrivateRoute";

export const UsuariosRoutes = () => {
  return [
    <Route
      key="perfil"
      path="/perfil"
      element={
        <PrivateRoute>
          <Perfil />
        </PrivateRoute>
      }
    />,
    <Route
      key="amigos"
      path="/amigos"
      element={
        <PrivateRoute>
          <Amigos />
        </PrivateRoute>
      }
    />,
    <Route
      key="chat"
      path="/chat"
      element={
        <PrivateRoute>
          <Chat />
        </PrivateRoute>
      }
    />
  ];
};
