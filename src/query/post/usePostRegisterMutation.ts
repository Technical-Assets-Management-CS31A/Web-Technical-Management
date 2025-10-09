import { useMutation } from "@tanstack/react-query";
import type { TRegisterUser } from "../../types/types";

const RegisterUser = async (formData: TRegisterUser) => {
  const BASE_URL = import.meta.env.VITE_REGISTER_USER_API;
  const newUserData = JSON.stringify(formData)
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: newUserData,
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
