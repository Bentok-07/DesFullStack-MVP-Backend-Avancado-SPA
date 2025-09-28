// src/routes/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "../auth/auth"; 

export default function RequireAuth() {
  const location = useLocation();

  if (!isLoggedIn()) {
    // guarda para onde voltar após login (ex.: /conta/dados ou /conta/pedidos)
    const path = location.pathname + (location.search || "");
    sessionStorage.setItem("redirectTo", path);
    return <Navigate to="/login" replace />;
  }

  // logado → libera as rotas-filhas
  return <Outlet />;
}
