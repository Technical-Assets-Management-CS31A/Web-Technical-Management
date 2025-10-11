import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { getToken } from "../utils/token";

const getAccessTokenKey = (): string => {
  const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
  return key;
};

const getRefreshAccessToken = async (): Promise<string | null> => {
  try {
    const BASE_URL = import.meta.env.VITE_REFRESH_TOKEN_API;
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "refreshToken is failed");

    return data.data;

  } catch (err) {
    console.error("Failed to refresh token:", err);
    return null;
  }
};

export const useAuth = () => {
  const key = getAccessTokenKey();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(() => getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));

  useEffect(() => {
    const refreshNow = async () => {
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

    refreshNow();
  }, [token, key]);

  return {
    key,
    token,
    isAuthenticated,
    loading,
  };
};
