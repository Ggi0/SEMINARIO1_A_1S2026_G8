import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import Publicaciones from "./pages/publicaciones/Publicaciones";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/inicio">Inicio</Link> |{" "}
        <Link to="/publicaciones">Publicaciones</Link>
      </nav>

      <Routes>
        <Route path="/inicio" element={<Home />} />
        <Route path="/publicaciones" element={<Publicaciones />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;