/**
 * Thin typed client for the Krear Django REST backend.
 * Base URL is configurable so the same build works against local + deployed API.
 */

export const API_BASE = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000"
).replace(/\/$/, "");

const ACCESS_KEY = "krear.access";
const REFRESH_KEY = "krear.refresh";

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
    window.dispatchEvent(new Event("krear:auth"));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.dispatchEvent(new Event("krear:auth"));
  },
};

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function refreshAccess(): Promise<boolean> {
  const refresh = tokenStore.refresh;
  if (!refresh) return false;
  const res = await fetch(`${API_BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { access: string };
  tokenStore.set(data.access);
  return true;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit & { retry?: boolean } = {},
): Promise<T> {
  const { retry = true, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!(rest.body instanceof FormData) && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  const access = tokenStore.access;
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });

  if (res.status === 401 && retry && (await refreshAccess())) {
    return apiFetch<T>(path, { ...init, retry: false });
  }

  if (!res.ok) {
    let payload: unknown = null;
    let message = `Request failed (${res.status})`;
    try {
      payload = await res.json();
      const detail = (payload as { detail?: string })?.detail;
      if (detail) message = detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message, payload);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

/** DRF list endpoints may or may not be paginated - normalise both shapes. */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: T[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export async function getList<T>(path: string): Promise<T[]> {
  return unwrapList<T>(await api.get<unknown>(path));
}
