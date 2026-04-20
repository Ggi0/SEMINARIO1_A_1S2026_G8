import { useEffect, useState } from "react";
import { getPublicaciones } from "../../services/publicaciones/publicaciones";

function Publicaciones() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getPublicaciones()
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Publicaciones</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Publicaciones;