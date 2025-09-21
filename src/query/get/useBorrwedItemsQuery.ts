import { queryOptions } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const BorrowItems = async () => {
  const BASE_URL = import.meta.env.VITE_ITEM_BORROWS_API;

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

export const useBorrowedItemsQuery = () => {
  return queryOptions({
    queryKey: ["borrowed-items"],
    queryFn: BorrowItems,
  });
};
