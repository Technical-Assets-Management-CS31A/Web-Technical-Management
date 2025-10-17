import { getToken } from "../../utils/token";
import { queryOptions } from "@tanstack/react-query";

const fetchUserData = async () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const END_POINT = "/api/v1/auth/me";

  const res = await fetch(`${BASE_URL}${END_POINT}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "User not found");
  }
  return data.data;
};

export const useUserQuery = () => {
  return queryOptions({
    queryKey: ["me"],
    queryFn: fetchUserData,
    staleTime: Infinity,
  });
};
