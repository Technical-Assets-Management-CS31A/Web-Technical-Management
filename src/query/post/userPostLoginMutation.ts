import { useMutation } from "@tanstack/react-query";
import type { TLoginUser } from "../../types/types";

const LoginUser = async (formData: TLoginUser) => {
  const BASE_URL = import.meta.env.VITE_LOGIN_USER_API;
  const userFormData = JSON.stringify(formData)
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: userFormData,
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to login user");
  }
  return data;
};

export const usePostLoginMutation = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: LoginUser,
  });
};
