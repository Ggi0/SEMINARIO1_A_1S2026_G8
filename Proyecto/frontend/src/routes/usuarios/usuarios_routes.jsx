import { Route } from "react-router-dom";
import Amigos from "../../pages/usuarios/Amigos";
import Perfil from "../../pages/usuarios/Perfil";

export const UsuariosRoutes = () => {
  return [
    <Route key="perfil" path="/perfil" element={<Perfil />} />,
    <Route key="amigos" path="/amigos" element={<Amigos />} />
  ];
};
