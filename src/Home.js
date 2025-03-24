import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token) {
      navigate("/"); // Redirige si no hay token
      return;
    }

    // En lugar de verificar, simplemente mostramos el token
    setMessage(`Bienvenido, ${email} - IDGS011. Token: ${token}`);
  }, [navigate]);

  return <h1>{message}</h1>;
}

export default Home;
