import { queryOptions } from "@tanstack/react-query";
import { getToken } from "../../utils/token";


const SummaryData = async () => {
    const BASE_URL = import.meta.env.VITE_SUMMARY_DATA_API
    const res = await fetch(BASE_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to fetch summary");
    return data
}

export const useSummaryDataQuery = () => {
    return queryOptions({
        queryKey: ["summary"],
        queryFn: SummaryData
    })
}