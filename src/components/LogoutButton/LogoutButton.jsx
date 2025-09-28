// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout, isLoggedIn, getCurrentUser } from "../../auth/auth";

export default function LogoutButton({ redirectTo = "/" , clearCart = false, className = "" }) {
  const navigate = useNavigate();
  if (!isLoggedIn()) return null;

  const user = getCurrentUser();
  const label = user?.name ? `Sair (${user.name})` : "Sair";

  const handleClick = () => {
    logout({ clearCart });
    navigate(redirectTo, { replace: true });
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
