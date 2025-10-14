import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const ArchiveUser = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_USERS_ARCHIVE_API;

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

export const useArchiveUserMutation = () => {
  return useMutation({
    mutationKey: ["users"],
    mutationFn: ArchiveUser,
  });
};
