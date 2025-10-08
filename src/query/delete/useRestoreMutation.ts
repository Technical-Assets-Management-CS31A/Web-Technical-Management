import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const restoreItem = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_RESTORE_ITEMS_API
  const itemId = JSON.stringify(id)
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: itemId,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to restore item");
  }

  return data;
};

export const useRestoreMutation = () => {
  return useMutation({
    mutationKey: ["restore"],
    mutationFn: restoreItem,
  });
};
