import { queryOptions } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const allItems = async () => {
  const BASE_URL = import.meta.env.VITE_INVENTORY_LIST_API;

  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch item details");
  return res.json();
};
export const useAllItemsQuery = () => {
    return queryOptions({
        queryKey: ["Item"],
        queryFn: allItems
    });
}