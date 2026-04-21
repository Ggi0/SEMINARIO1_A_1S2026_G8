import { useState } from "react";
import { confirmarCorreo } from "../../services/sesion/sesion";

function ConfirmarCorreo() {
  const [form, setForm] = useState({
    username: "",
    codigo: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await confirmarCorreo(form);

    console.log(res);

    if (res.ok) {
      alert("Correo confirmado correctamente");
    }
  };

  return (
    <div>
      <h1>CONFIRMAR CORREO</h1>

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Correo" onChange={handleChange} />
        <input name="codigo" placeholder="Código" onChange={handleChange} />

        <button type="submit">Confirmar</button>
      </form>
    </div>
  );
}

export default ConfirmarCorreo;