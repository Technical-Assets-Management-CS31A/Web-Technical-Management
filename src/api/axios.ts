import axios from "axios";
import { getToken, removeToken, setToken } from "../utils/token";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

// ── Request interceptor — attach the current access token ─────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// ── Silent token refresh ───────────────────────────────────────────────────
// One refresh at a time: the interceptor and the route guard share the same in-flight call.
let refreshInFlight: Promise<string> | null = null;

const requestNewAccessToken = async (): Promise<string> => {
  // Plain fetch so the call skips the interceptors; the HttpOnly refresh-token cookie rides along.
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  const newToken: unknown = data?.data?.accessToken ?? data?.data;
  if (typeof newToken !== "string" || !newToken) throw new Error("No token in refresh response");

  // Store the new access token in the cookie so getToken() picks it up
  setToken(newToken);
  return newToken;
};

export const refreshAccessToken = (): Promise<string> => {
  refreshInFlight ??= requestNewAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

// A 401 from these means bad credentials or a dead session, not an expired access token.
const NO_REFRESH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout", "/auth/forgot-password"];
const skipsRefresh = (url?: string) => !!url && NO_REFRESH_PATHS.some((path) => url.endsWith(path));

// ── Response interceptor — silently refresh on 401 ────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request (_retry flag).
    // Requests that 401 together all wait on the same refresh call.
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !skipsRefresh(originalRequest.url)) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired/invalid — force logout
        removeToken();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
