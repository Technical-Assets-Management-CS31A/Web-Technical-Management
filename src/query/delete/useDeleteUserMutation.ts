import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const DeleteUser = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_STAFF_LIST_API;

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    }
  });

  if (!res.ok) {
    throw new Error("Failed to delete item");
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const useDeleteUserMutation = () => {
  return useMutation({
    mutationKey: ["staff"],
    mutationFn: DeleteUser,
  });
};
