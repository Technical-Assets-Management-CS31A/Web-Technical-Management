import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const DeleteStaff = async (id: number) => {
  const BASE_URL = import.meta.env.VITE_STAFF_LIST_API;

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    credentials: "include",
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

export const useDeleteStaffMutation = (id: number) => {
  return useMutation({
    mutationKey: ["staff", id],
    mutationFn: DeleteStaff,
  });
};
