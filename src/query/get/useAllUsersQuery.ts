import { queryOptions } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const AllStaffs = async () => {
  const BASE_URL = import.meta.env.VITE_USERS_LIST_API;

  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();

  if(!res.ok) throw new Error(data.message || "Error fetching API");

  return data.data;
};

export const useAllUsersQuery = () => {
  return queryOptions({
    queryKey: ["staffs"],
    queryFn: AllStaffs,
  });
};
