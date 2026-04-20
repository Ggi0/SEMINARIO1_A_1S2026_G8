import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link> |{" "}
      <Link to="/publicaciones">Publicaciones</Link> |{" "}
      <Link to="/login">Login</Link> |{" "}
      <Link to="/registro">Registro</Link> |{" "}
    </nav>
  );
}

export default Navbar;
