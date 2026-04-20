import { useEffect, useState } from "react";
import { getApiStatus } from "../services/api_servicio";

function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getApiStatus()
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Bienvenido</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Home;