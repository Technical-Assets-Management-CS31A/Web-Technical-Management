import { useMutation } from "@tanstack/react-query";
import type { TUserFormData } from "../../types/types";
import { getToken } from "../../utils/token";

const PostUser = async (formData: TUserFormData) => {
  const BASE_URL = import.meta.env.VITE_REGISTER_USER_API;
  const newUserData = JSON.stringify(formData)
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type" : "application/json"
    },
    body: newUserData,
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  return data.message;
};

export const usePostUserMutation = () => {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: PostUser,
  });
};
