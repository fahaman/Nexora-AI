/**
 * Real auth store backed by the API.
 * Preserves the previous surface — useAuth(), authStore.login/logout/setBusiness —
 * so existing components don't need rewrites.
 */
import { useSyncExternalStore } from "react";
import { authApi, type AuthUser } from "./api/endpoints";
import { tokens, apiConfigured } from "./api/client";

type State = {
  user: (AuthUser & { name: string }) | null;
  businessId: string;
  initialized: boolean;
};

const BIZ_KEY = "nexora.activeBusiness";
const USER_KEY = "nexora.user";

const readInitial = (): State => {
  if (typeof window === "undefined") {
    return { user: null, businessId: "all", initialized: false };
  }
  let user: State["user"] = null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) user = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {
    user,
    businessId: localStorage.getItem(BIZ_KEY) ?? "all",
    initialized: false,
  };
};

let state: State = readInitial();
const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") {
    if (state.user) localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    else localStorage.removeItem(USER_KEY);
    localStorage.setItem(BIZ_KEY, state.businessId);
  }
  listeners.forEach((l) => l());
};

async function bootstrap() {
  if (state.initialized) return;
  if (apiConfigured() && tokens.access && !state.user) {
    try {
      const me = await authApi.me();
      state = { ...state, user: { ...me, name: me.name } };
    } catch {
      tokens.clear();
      state = { ...state, user: null };
    }
  }
  state = { ...state, initialized: true };
  emit();
}

export const authStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    if (!state.initialized) void bootstrap();
    return () => listeners.delete(l);
  },
  async login(email: string, password: string) {
    if (apiConfigured()) {
      try {
        const res = await authApi.login({ email, password });
        tokens.set(res.accessToken, res.refreshToken);
        state = { ...state, user: res.user, initialized: true };
        emit();
        return;
      } catch (err: unknown) {
        const isNetworkErr =
          err instanceof Error &&
          (err.message.includes("Failed to fetch") || err.name === "TypeError");
        if (isNetworkErr) {
          console.warn("Backend API unreachable, logging in via Demo Mode.");
          state = {
            ...state,
            user: { id: "demo", email, name: email.split("@")[0] || "Owner", role: "admin" },
            initialized: true,
          };
          emit();
          return;
        }
        throw err;
      }
    }
    // Demo fallback when backend not deployed yet
    state = {
      ...state,
      user: { id: "demo", email, name: "Owner", role: "admin" },
      initialized: true,
    };
    emit();
  },
  async register(input: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    countryCode?: string;
    gst?: string;
  }) {
    if (apiConfigured()) {
      try {
        const res = await authApi.register(input);
        tokens.set(res.accessToken, res.refreshToken);
        state = { ...state, user: res.user, initialized: true };
        emit();
        return;
      } catch (err: unknown) {
        const isNetworkErr =
          err instanceof Error &&
          (err.message.includes("Failed to fetch") || err.name === "TypeError");
        if (isNetworkErr) {
          console.warn("Backend API unreachable, registering via Demo Mode.");
          state = {
            ...state,
            user: { id: "demo", email: input.email, name: input.name, role: "admin" },
            initialized: true,
          };
          emit();
          return;
        }
        throw err;
      }
    }
    state = {
      ...state,
      user: { id: "demo", email: input.email, name: input.name, role: "admin" },
      initialized: true,
    };
    emit();
  },
  async logout() {
    const rt = tokens.refresh;
    if (apiConfigured() && rt) {
      try {
        await authApi.logout(rt);
      } catch {
        /* ignore */
      }
    }
    tokens.clear();
    state = { ...state, user: null };
    emit();
  },
  setBusiness(id: string) {
    state = { ...state, businessId: id };
    emit();
  },
};

const serverSnapshot: State = { user: null, businessId: "all", initialized: true };

export const useAuth = () =>
  useSyncExternalStore(
    authStore.subscribe,
    () => authStore.get(),
    () => serverSnapshot,
  );

export const useRole = () => useAuth().user?.role ?? null;
export const hasRole = (...roles: Array<"admin" | "manager" | "employee">) => {
  const r = authStore.get().user?.role;
  return r ? roles.includes(r) : false;
};
