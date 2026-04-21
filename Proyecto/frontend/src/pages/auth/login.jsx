import { useState } from "react";
import { login } from "../../services/sesion/sesion";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form);

    console.log(res);

    if (res.ok) {
      localStorage.setItem("accessToken", res.accessToken);
      alert("Login exitoso");
    }
  };

  return (
    <div>
      <h1>LOGIN</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="username"
          placeholder="Correo"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;