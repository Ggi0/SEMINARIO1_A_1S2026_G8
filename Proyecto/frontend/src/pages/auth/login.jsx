import { useState, useRef } from "react";
import { login, loginFacial } from "../../services/sesion/sesion";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // LOGIN NORMAL
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form);

    if (res.ok) {
      localStorage.setItem("accessToken", res.accessToken);
      alert("Login exitoso");
    }
  };

  // ENCENDER CÁMARA
  const iniciarCamara = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = mediaStream;
    setStream(mediaStream);
  };

  // CAPTURAR FOTO Y ENVIAR
  const capturarYLogin = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // Convertir a Blob
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "foto.jpg", { type: "image/jpeg" });

      const res = await loginFacial(file);

      console.log(res);

      if (res.ok) {
        localStorage.setItem("accessToken", res.accessToken);
        alert("Login facial exitoso");
      } else {
        alert(res.mensaje);
      }
    }, "image/jpeg");
  };


  return (
    <div>
      <h1>LOGIN</h1>

      {/* LOGIN NORMAL */}
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

      <hr />

      {/* LOGIN FACIAL */}
      <h2>Login Facial</h2>

      <button onClick={iniciarCamara}>Encender Cámara</button>

      <br /><br />

      <video ref={videoRef} autoPlay width="300" />

      <br /><br />

      <button onClick={capturarYLogin}>Capturar y Login</button>

      {/* Canvas oculto */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default Login;