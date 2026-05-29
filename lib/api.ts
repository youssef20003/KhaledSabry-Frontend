import { clearCartId, getAdminSession, getCartId, setCartId } from "./storage";
import { Cart, CatalogOption, CheckoutForm, Order, PaginationResult, Product, ProductUpsert, UserSession } from "./types";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    const token = getAdminSession()?.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`/api/backend${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const errors = Array.isArray(payload.errors) ? ` ${payload.errors.join(", ")}` : "";
    throw new Error(`${payload.message ?? "Request failed."}${errors}`);
  }

  return response.json() as Promise<T>;
}

export function getProducts(params: URLSearchParams) {
  return request<PaginationResult<Product>>(`/products?${params.toString()}`);
}

export function getFeaturedProducts(take = 4) {
  return request<Product[]>(`/products/featured?take=${take}`);
}

export function getProduct(id: number) {
  return request<Product>(`/products/${id}`);
}

export function getBrands() {
  return request<CatalogOption[]>("/products/brands");
}

export function getTypes() {
  return request<CatalogOption[]>("/products/types");
}

export async function ensureCart() {
  const existing = getCartId();
  if (existing) {
    return request<Cart>(`/carts/${existing}`);
  }

  const cart = await request<Cart>("/carts", { method: "POST" });
  setCartId(cart.id);
  return cart;
}

export async function addCartItem(productId: number, color: string, size: string, quantity = 1) {
  const cart = await ensureCart();
  const updated = await request<Cart>(`/carts/${cart.id}/items`, {
    method: "PUT",
    body: JSON.stringify({ productId, color, size, quantity })
  });
  setCartId(updated.id);
  return updated;
}

export async function updateCartItem(productId: number, color: string, size: string, quantity: number) {
  const cart = await ensureCart();
  return request<Cart>(`/carts/${cart.id}/items`, {
    method: "PATCH",
    body: JSON.stringify({ productId, color, size, quantity })
  });
}

export async function removeCartItem(productId: number, color: string, size: string) {
  const cart = await ensureCart();
  const params = new URLSearchParams({ color, size });
  return request<Cart>(`/carts/${cart.id}/items/${productId}?${params.toString()}`, {
    method: "DELETE"
  });
}

export async function placeOrder(customer: CheckoutForm, cart: Cart) {
  const order = await request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        street: customer.street,
        city: customer.city,
        country: customer.country
      },
      items: cart.items.map(item => ({
        productId: item.productId,
        color: item.color,
        size: item.size,
        quantity: item.quantity
      }))
    })
  });

  await request(`/carts/${cart.id}`, { method: "DELETE" });
  clearCartId();
  return order;
}

export function loginAdmin(email: string, password: string) {
  return request<UserSession>("/authentication/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function getAdminProducts(params: URLSearchParams) {
  return request<PaginationResult<Product>>(`/admin/products?${params.toString()}`, { auth: true });
}

export function createProduct(product: ProductUpsert) {
  return request<Product>("/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
    auth: true
  });
}

export function updateProduct(id: number, product: ProductUpsert) {
  return request<Product>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
    auth: true
  });
}

export function setProductDiscount(id: number, discountPercentage: number) {
  return request<Product>(`/admin/products/${id}/discount`, {
    method: "PATCH",
    body: JSON.stringify({ discountPercentage }),
    auth: true
  });
}

export function deleteProduct(id: number) {
  return request<boolean>(`/admin/products/${id}`, {
    method: "DELETE",
    auth: true
  });
}

export function getAdminOrders() {
  return request<Order[]>("/orders/allorders", { auth: true });
}
