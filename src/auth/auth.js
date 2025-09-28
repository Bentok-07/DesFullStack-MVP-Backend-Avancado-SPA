// src/auth/auth.js
const CURRENT_KEY = "currentCustomer";     
const TOKEN_KEY   = "authToken";           
const CART_KEY    = "cart";                

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); }
  catch { return null; }
}

export function isLoggedIn() {
  const u = getCurrentUser();
  return !!(u && u.id); 
}

export function logout({ clearCart = false } = {}) {
  try {
    localStorage.removeItem(CURRENT_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("redirectTo");
    if (clearCart) localStorage.removeItem(CART_KEY);
  } catch (_) {}
}

export function saveCurrentUser(user, token = null) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
}
