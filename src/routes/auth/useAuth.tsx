import { useEffect, useState } from "react";
import { refreshAccessToken } from "../../api/axios";
import { getToken } from "../../utils/token";

export const useAuth = () => {
  const [token, setToken] = useState<string | undefined>(() => getToken());
  const [loading, setLoading] = useState(!token);

  useEffect(() => {

    if (token) return;

    // On failure the refresh token is also gone or expired, so the user must log in again.
    let cancelled = false;
    refreshAccessToken()
      .then((newToken) => !cancelled && setToken(newToken))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { token, isAuthenticated: Boolean(token), loading };
};
