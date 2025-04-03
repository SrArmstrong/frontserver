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

    //fetch("https://server1-gb00.onrender.com/api/verify-token", {
    fetch("https://server2-p77b.onrender.com/api/verify-token", {
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
          localStorage.removeItem("token");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <h2>Home</h2>
      <p>{message}</p>
      <p>Este proyecto consiste en un sistema de monitoreo comparativo entre dos servidores REST desarrollados en Node.js, donde el Servidor 1 implementa limitación de peticiones (Rate Limit) y el Servidor 2 opera sin esta restricción. El sistema recopila y analiza los logs generados por ambos servidores, mostrando mediante gráficas de barras comparativas métricas como niveles de registro, tipos de peticiones HTTP, tiempos de respuesta y distribución de códigos de estado, permitiendo visualizar las diferencias de comportamiento entre ambas configuraciones.</p>
      <p>La solución incluye un frontend con autenticación JWT y MFA que muestra las estadísticas de los logs almacenados en Firestore, organizadas por servidor. El panel de gráficas contrasta específicamente cómo afecta la implementación del Rate Limit en el Servidor 1 frente al Servidor 2, evidenciando patrones como la distribución de cargas, frecuencia de peticiones y comportamiento de los usuarios ante las restricciones, cumpliendo con los requisitos académicos establecidos para el proyecto.</p>
      <p><b>Alumno</b>: TSU Sergio Pérez Aldavalde</p>
      <p><b>Grupo</b>: IDGS011</p>
      <p><b>Profesor</b>: M.C.C Emmanuel Martínez Hernández</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
      <button onClick={() => navigate("/graficas")}>Ver Gráficas</button>
    </div>
  );
}

export default Home;
