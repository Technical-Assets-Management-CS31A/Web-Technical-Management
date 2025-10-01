import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const DeleteItem = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_ITEM_DELETE;

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to delete item");
  return data;
};

export const useDeleteItemMutation = () => {
  return useMutation({
    mutationKey: ["Item"],
    mutationFn: DeleteItem,
  });
};
