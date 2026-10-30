import { api } from "./axios";
import type { ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, UserDto } from "../@types/types";
import { removeToken } from "../utils/token";

export const LoginUserApi = async (data: LoginRequest) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logoutUserApi = async () => {
  const response = await api.post("/auth/logout");
  if (response) {
    removeToken();
  }
  return response.data;
};

export const meApi = async (): Promise<UserDto> => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

// Team call: not in PRD 6.3.
export const forgotPasswordApi = async (data: ForgotPasswordRequest) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

// Team call: not in PRD 6.3. Omit id to change your own password.
export const changePasswordApi = async ({ id, data }: { id?: string; data: ChangePasswordRequest }) => {
  const response = await api.post(id ? `/users/${id}/change-password` : "/auth/change-password", data);
  return response.data;
};
