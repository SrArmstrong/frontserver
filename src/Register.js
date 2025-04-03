import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
    const response = await fetch("https://server1-gb00.onrender.com/api/register", {
    //const response = await fetch("https://server2-p77b.onrender.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registro exitoso. Escanea el código QR para configurar MFA.");
        setQrCodeUrl(data.qrCodeUrl);
        //setTimeout(() => navigate("/login"), 3000); // Redirige a login después de 3 segundos
      } else {
        setMessage(data.message || "Error en el registro");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setMessage("Error en el servidor");
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Nombre de usuario:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Registrarse</button>
      </form>
      {message && <p>{message}</p>}
      {qrCodeUrl && <img src={qrCodeUrl} alt="Código QR para MFA" />}
      <button onClick={() => navigate("/")}>Logearse</button>
    </div>
  );
}

export default Register;
