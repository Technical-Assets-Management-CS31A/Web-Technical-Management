import { useMutation } from "@tanstack/react-query";
import type { TItemForm } from "../../types/types";
import { getToken } from "../../utils/token";

const PostItem = async (formData: TItemForm) => {
  const BASE_URL = import.meta.env.VITE_CREATE_ITEM_API;
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(formData),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
};
export const usePostItemMutation = () => {
  return useMutation({
    mutationFn: PostItem,
  });
};
