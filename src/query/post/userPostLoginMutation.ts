import { useMutation } from "@tanstack/react-query";
import { saveToken } from "../../utils/token";
import type { TLoginUser } from "../../types/types";

const LoginUser = async (formData: TLoginUser) => {
  const BASE_URL = import.meta.env.VITE_LOGIN_USER_API;
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to login user");
  }

  saveToken(data.accessToken);

  return data;
};

export const usePostLoginMutation = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: LoginUser,
  });
};
