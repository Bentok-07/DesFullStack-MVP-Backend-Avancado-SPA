// src/components/LoginButton/LoginButton.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginButton({ className = "", redirectTo = null }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // guarda rota de retorno: usa a prop ou a rota atual
    const back = redirectTo ?? location.pathname ?? "/";
    sessionStorage.setItem("redirectTo", back);
    navigate("/login");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      Entrar
    </button>
  );
}
