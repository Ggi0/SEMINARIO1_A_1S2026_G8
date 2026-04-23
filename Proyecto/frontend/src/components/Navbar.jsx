import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link> |{" "}
      <Link to="/publicaciones">Publicaciones</Link> |{" "}
      <Link to="/amigos">Amigos</Link> |{" "}
      <Link to="/perfil">Perfil</Link> |{" "}
      <Link to="/login">Login</Link> |{" "}
      <Link to="/registro">Registro</Link> |{" "}
      <Link to="/confirmar-correo">Confirmar Correo</Link> |{" "}
    </nav>
  );
}

export default Navbar;
