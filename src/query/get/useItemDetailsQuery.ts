import { queryOptions } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const GetItemDetails = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL
  const END_POINT = "/api/v1/items";

  const res = await fetch(`${BASE_URL}${END_POINT}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch item details");
  return data.data;
};

export const useItemDetailsQuery = (id: string) => {
  return queryOptions({
    queryKey: ["Item", id],
    queryFn: () => GetItemDetails(id),
  });
};
