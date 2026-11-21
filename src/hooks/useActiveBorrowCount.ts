import { useQuery } from "@tanstack/react-query";
import { useAllLoans } from "./loanHooks";

// Loans still out: ACTIVE plus OVERDUE.
export const useActiveBorrowCount = () => {
    const { data } = useQuery(useAllLoans());

    if (!data) return 0;

    return data.filter((loan) => loan.status === "ACTIVE" || loan.status === "OVERDUE").length;
};
