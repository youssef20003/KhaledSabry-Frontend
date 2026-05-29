import { UserSession } from "./types";

const cartKey = "shirt_cart_id";
const adminKey = "shirt_admin_session";

export function getCartId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(cartKey);
}

export function setCartId(cartId: string) {
  window.localStorage.setItem(cartKey, cartId);
}

export function clearCartId() {
  window.localStorage.removeItem(cartKey);
}

export function getAdminSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(adminKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    window.localStorage.removeItem(adminKey);
    return null;
  }
}

export function setAdminSession(session: UserSession) {
  window.localStorage.setItem(adminKey, JSON.stringify(session));
}

export function clearAdminSession() {
  window.localStorage.removeItem(adminKey);
}
