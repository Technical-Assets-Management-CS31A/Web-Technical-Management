import { useMutation } from "@tanstack/react-query";
import type { TUserFormData } from "../../types/types";
import { getToken } from "../../utils/token";

const PostUser = async (formData: TUserFormData) => {
  const BASE_URL = import.meta.env.VITE_REGISTER_USER_API;
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data);
  console.log(data);

  return data;
};

export const usePostUserMutation = () => {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: PostUser,
  });
};
