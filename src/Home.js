import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [message, setMessage] = useState("Verificando sesión...");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("No autorizado. Redirigiendo...");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    // Enviar token al servidor para verificar si sigue siendo válido
    fetch("https://server1-gb00.onrender.com/api/verify-token", {
    //fetch("http://localhost:3001/api/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Enviar token en el encabezado
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.valid) {
          setMessage(`Bienvenido, sesión válida`);
        } else {
          localStorage.removeItem("token"); // Eliminar token inválido
          setMessage("Sesión expirada. Redirigiendo...");
          setTimeout(() => navigate("/"), 2000);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setMessage("Error en la verificación. Redirigiendo...");
        setTimeout(() => navigate("/"), 2000);
      });
  }, [navigate]);

  return (
    <div>
      <h2>Home</h2>
      <p>{message}</p>
      <p>Esta aplicación está desarrollada con un backend en Node.js y Express, utilizando Firebase para la autenticación y almacenamiento de datos. En el frontend, se utiliza React para la interfaz de usuario, proporcionando una experiencia dinámica e interactiva.</p>
      <p><b>Alumno</b>: TSU Sergio Pérez Aldavalde</p>
      <p><b>Grupo</b>: IDGS011</p>
      <p><b>Profesor</b>: M.C.C Emmanuel Martínez Hernández</p>
    </div>
  );
}

export default Home;
