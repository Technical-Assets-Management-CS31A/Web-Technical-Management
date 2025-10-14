import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const deleteItem = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_ITEM_DELETE_API
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete item");
  }

  return data;
};

export const useDeleteItemMutation = () => {
  return useMutation({
    mutationKey: ["archiveitems"],
    mutationFn: deleteItem,
  });
};
