import { useRouter } from "@tanstack/react-router";

export const useNotFoundViewModel = () => {
  const router = useRouter();
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  return {
    /** The address that failed, shown so a typo is easy to spot; hidden for the root. */
    requestedPath: path && path !== "/" ? path : "",
    year: new Date().getFullYear(),
    goBack: () => router.history.back(),
  };
};

export type NotFoundViewModel = ReturnType<typeof useNotFoundViewModel>;
