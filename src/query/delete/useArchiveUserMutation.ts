import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const ArchiveUser = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const END_POINT = "/api/v1/users";

  const res = await fetch(`${BASE_URL}${END_POINT}/${id}`, {
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
