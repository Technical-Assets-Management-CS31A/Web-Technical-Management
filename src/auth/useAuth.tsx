import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/token";

export type MyTokenPayload = {
  id: string;
  name: string;
  email: string;
  exp: number;
};

export function useAuth() {
  const [user, setUser] = useState<MyTokenPayload | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);

      const mapped: MyTokenPayload = {
        id: decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
        name: decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ],
        email:
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        exp: decoded.exp,
      };

      setUser(mapped);
    } catch (err) {
      console.error("Invalid token", err);
      setUser(null);
    }
  }, []);

  return user;
}
