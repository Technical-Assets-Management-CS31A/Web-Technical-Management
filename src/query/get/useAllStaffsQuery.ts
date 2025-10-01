import { queryOptions } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const AllStaffs = async () => {
  const BASE_URL = import.meta.env.VITE_STAFF_LIST_API;

  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    credentials: "include",
  });

  const data = await response.json();

  return data;
};

export const useAllStaffsQuery = () => {
  return queryOptions({
    queryKey: ["staffs"],
    queryFn: AllStaffs,
  });
};
