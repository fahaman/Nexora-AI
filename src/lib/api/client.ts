/**
 * Typed fetch client with automatic JWT attach + refresh-on-401 retry.
 * Falls back to a clear error message when VITE_API_URL is not set.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const ACCESS_KEY = "nexora.access";
const REFRESH_KEY = "nexora.refresh";

export const tokens = {
  get access() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const apiConfigured = () => API_URL.length > 0;

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOpts {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean; // default true
  signal?: AbortSignal;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!tokens.refresh) return false;
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken: tokens.refresh }),
        });
        if (!res.ok) {
          tokens.clear();
          return false;
        }
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        tokens.set(data.accessToken, data.refreshToken);
        return true;
      } catch {
        tokens.clear();
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiFetch<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  if (!apiConfigured()) {
    throw new ApiError(0, "Backend not configured. Set VITE_API_URL to your API base URL.");
  }
  const { method = "GET", body, query, auth = true, signal } = opts;

  const url = new URL(API_URL + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = { accept: "application/json" };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (auth && tokens.access) headers.authorization = `Bearer ${tokens.access}`;
    return fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  };

  let res = await doFetch();
  if (res.status === 401 && auth && tokens.refresh) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await doFetch();
  }

  const ct = res.headers.get("content-type") ?? "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in (data as Record<string, unknown>)
        ? String((data as { error: unknown }).error)
        : res.statusText || "Request failed";
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}
