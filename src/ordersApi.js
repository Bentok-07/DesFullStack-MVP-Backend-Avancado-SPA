// src/services/ordersApi.js
import { http } from "./http";


const BASE = process.env.REACT_APP_ORDERS_API_URL || "http://localhost:5001";

export function createOrder({ customer_id = null, items = [] }) {
  return http(`${BASE}/orders`, {
    method: "POST",
    body: JSON.stringify({ customer_id, items }),
  });
}

export function listOrders(params = {}) {
  const url = new URL(`${BASE}/orders`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, v);
  });
  return http(url.toString());
}

export function getOrder(id) {
  return http(`${BASE}/orders/${id}`);
}

// Cotação USD→BRL
export async function getUsdBrlRate() {
  try {
    const r = await http(`${BASE}/health/rate`);
    const rate = typeof r === "number" ? r : Number(r.rate ?? r.usd_brl ?? r.value);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("invalid rate");
    return { rate, isFallback: false };
  } catch {
    return { rate: 1, isFallback: true };
  }
}

export async function deleteOrderById(orderId) {
  const resp = await fetch(`${BASE}/orders/${orderId}`, { method: "DELETE" });
  if (resp.status === 404) throw new Error("Pedido não encontrado.");
  if (resp.status === 409) throw new Error("Somente pedidos PENDING podem ser cancelados.");
  if (!resp.ok) throw new Error(`Falha ao cancelar pedido (${resp.status}).`);
  return true;
}
