import { Routes, Route } from "react-router-dom";
import Login from "../../pages/auth/login";
import Registro from "../../pages/auth/registro";


export const SesionRoutes = () => (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
    </>
  );