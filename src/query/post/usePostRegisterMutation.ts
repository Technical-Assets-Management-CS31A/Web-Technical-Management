import { useMutation } from "@tanstack/react-query";
import type { TRegisterUser } from "../../types/types";

const RegisterUser = async (formData: TRegisterUser) => {
  const BASE_URL = import.meta.env.VITE_REGISTER_USER_API;
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to register user");
  }

  return data;
};

export const usePostRegisterMutation = () => {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: RegisterUser,
  });
};
