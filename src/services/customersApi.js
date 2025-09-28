// src/services/customersApi.js
import { http } from './http';

const API_ROOT = process.env.REACT_APP_CUSTOMERS_API_URL || 'http://localhost:5000';
const BASE = `${API_ROOT}/api/v1`;

// Ex.: GET /api/v1/address/cep/01001000
export function cepLookup(cep) {
  const onlyDigits = String(cep || '').replace(/\D/g, '');
  return http(`${BASE}/address/cep/${onlyDigits}`);
}

// --- Auth & Customers (SPA) ---
export async function registerCustomer({
  name,
  email,
  phone,
  password,
  cep,
  street,
  neighborhood,
  city,
  state,
}) {
  const payload = {
    name,
    email,
    phone,
    password,     
    cep,
    street,
    neighborhood,
    city,
    state,
  };
  return http(`${BASE}/customers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginCustomer({ email, password }) {
  const res = await http(`${BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  if (!res?.customer) throw new Error("Resposta inválida do login");
  saveCurrentCustomer(res.customer);
  return res.customer;
}


const CURRENT_CUSTOMER_KEY = "currentCustomer";

export function saveCurrentCustomer(customer) {
  localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(customer));
}

export function getCurrentCustomer() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_CUSTOMER_KEY) || "null");
  } catch {
    return null;
  }
}

export function logoutCustomer() {
  localStorage.removeItem(CURRENT_CUSTOMER_KEY);
}



export async function getCustomerById(id) {
  if (!id) throw new Error("getCustomerById: id inválido");
  return http(`${BASE}/customers/${id}`);
}


export async function updateCustomer(id, changes = {}) {
  if (!id) throw new Error("updateCustomer: id inválido");
  return http(`${BASE}/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });
}

