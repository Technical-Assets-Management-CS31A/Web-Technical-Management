import Cookies from "js-cookie";

const getAccessTokenKey = (): string => {
  const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
  if (!key) {
    console.warn(
      "Environment variable 'VITE_ACCESS_TOKEN_KEY' is undefined. Using fallback key 'accessToken'."
    );
    return "accessToken";
  }
  return key;
};

export const useAuth = () => {
  const key = getAccessTokenKey();
  const token = Cookies.get(key);

  return {
    key,
    token,
    isAuthenticated: Boolean(token),
  };
};
