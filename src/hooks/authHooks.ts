import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginUserApi, logoutUserApi } from "../api/auth_api";
import { signalRService } from "../services/signalrService";
import { resetLoansState } from "../states/loans-state";
import { resetRealtimeState } from "../states/realtime-state";

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: LoginUserApi,
    mutationKey: ["login"],
    // Start the new session without another account's cached data (e.g. ["me"]).
    onSuccess: () => {
      queryClient.clear();
      resetLoansState();
    },
  });
};

export const useLogoutUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUserApi,
    mutationKey: ["logout"],
    onSettled: () => {
      void signalRService.stop();
      resetRealtimeState();
      queryClient.clear();
      resetLoansState();
    },
  });
};
