import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { getToken } from "../utils/token";

const getAccessTokenKey = () => import.meta.env.VITE_ACCESS_TOKEN_KEY;
const BASE_URL = import.meta.env.VITE_REFRESH_TOKEN_API;

const getRefreshAccessToken = async (): Promise<string | null> => {
  try {
    if (!BASE_URL) throw new Error("Refresh token URL not found");

    const res = await fetch(BASE_URL, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to refresh token");

    return data.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const useAuth = () => {
  const key = getAccessTokenKey();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(() => getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));

  useEffect(() => {
    const refresh = async () => {
      if (token) {
        setLoading(false);
        return;
      }

      const newToken = await getRefreshAccessToken();
      
      if (newToken) {
        Cookies.set(key, newToken);
        setToken(newToken);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    refresh();
  }, [token, key]);

  return { token, isAuthenticated, loading };
};
