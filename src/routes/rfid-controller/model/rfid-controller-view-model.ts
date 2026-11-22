import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveKioskSessions } from "../../../hooks/loanHooks";
import type { CheckoutSessionDto } from "../../../@types/types";

export const STEP_ORDER: CheckoutSessionDto["status"][] = [
  "AWAITING_FINGERPRINT",
  "AWAITING_ASSET",
  "AWAITING_PHOTO",
  "AWAITING_APPROVAL",
  "AWAITING_CONFIRM",
  "COMPLETED",
];

export const useRfidControllerViewModel = () => {
  const { data, isError } = useQuery(useActiveKioskSessions());
  const sessions = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return {
    data,
    isError,
    sessions,
  };
};

export type RfidControllerViewModel = ReturnType<typeof useRfidControllerViewModel>;
