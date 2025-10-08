import { queryOptions } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

const ArchivesTable = async () => {
  const BASE_URL = import.meta.env.VITE_ARCHIVES_DATA_API;
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Archives Data not found");
  }
  return data.data;
};

export const useArchivesQuery = () => {
  return queryOptions({
    queryKey: ["archives"],
    queryFn: ArchivesTable,
  });
};
