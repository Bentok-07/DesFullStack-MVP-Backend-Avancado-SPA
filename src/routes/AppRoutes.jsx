// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home/Home";
import Componentes from "../pages/Componentes/Componentes";
import Detalhes from "../pages/Detalhes/Detalhes";
import Carrinho from "../pages/Carrinho/Carrinho";
import Busca from "../pages/Busca/Busca";
import FinalizarCompra from "../pages/FinalizarCompra/FinalizrCompra";
import Confirmacao from "../pages/Confirmacao/Confirmacao";
import MeusPedidos from "../pages/MeusPedidos/MeusPedidos";
import Login from "../pages/Login/Login";
import Cadastro from "../pages/Cadastro/Cadastro";

import RequireAuth from "./RequireAuth";
import ContaDados from "../pages/ContaDados/ContaDados";

function AppRoutes() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/componentes/:categoria" element={<Componentes />} />
      <Route path="/detalhes/:id" element={<Detalhes />} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/busca" element={<Busca />} />
      <Route path="/finalizar" element={<FinalizarCompra />} />
      <Route path="/confirmacao" element={<Confirmacao />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* rotas NOVAS protegidas (área da conta) */}
      <Route element={<RequireAuth />}>
        <Route path="/conta/dados" element={<ContaDados />} />
        <Route path="/conta/pedidos" element={<MeusPedidos />} />
      </Route>

      {/* compat: redireciona a rota antiga para a nova */}
      <Route path="/meus-pedidos" element={<Navigate to="/conta/pedidos" replace />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div style={{ paddingTop: "80px", textAlign: "center" }}>
            <h2>Página não encontrada</h2>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
