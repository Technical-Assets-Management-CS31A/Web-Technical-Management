import { api } from "./axios";
import type { ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, LoginResponse, UserDto } from "../@types/types";
import { isAxiosError } from "axios";
import { getRefreshToken, getToken, removeToken } from "../utils/token";
import { userFromToken } from "../lib/currentUser";
import { normalizeRole } from "../lib/loginRole";

// POST /auth/login → { accessToken, refreshToken, role }, with or without the { data } envelope.
// Bad credentials come back as 401 problem details (code INVALID_CREDENTIALS), missing fields as 400.
export const LoginUserApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data?.data ?? response.data;
};

// The local session ends even if the server call fails, so a dead backend cannot keep someone signed in.
// The backend revokes the refresh token named in the body.
export const logoutUserApi = async () => {
  const refreshToken = getRefreshToken();
  try {
    const response = await api.post("/auth/logout", refreshToken ? { refreshToken } : null);
    return response.data;
  } finally {
    removeToken();
  }
};

// GET /auth/me returns the signed-in user from the token (authCards is null there). A 401 means the
// token is dead or the account was deactivated or deleted; the axios interceptor refreshes once, then logs out.
const withRole = (user: UserDto, fallback: UserDto["role"]): UserDto =>
  ({ ...user, role: (normalizeRole(user.role) ?? fallback) as UserDto["role"] });

// Older backends without /auth/me: read the id from the access token and load /users/{id}.
// If that is refused (or missing), fall back to what the token itself says about the user.
const meFromUsersApi = async (tokenUser: UserDto): Promise<UserDto> => {
  if (!tokenUser.id) return tokenUser;
  try {
    const response = await api.get(`/users/${tokenUser.id}`);
    const user: UserDto | undefined = response.data?.data ?? response.data;
    return user?.id ? withRole(user, tokenUser.role) : tokenUser;
  } catch (error) {
    if (isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404)) return tokenUser;
    throw error;
  }
};

export const meApi = async (): Promise<UserDto> => {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const tokenUser = userFromToken(token);
  try {
    const response = await api.get("/auth/me");
    const user: UserDto | undefined = response.data?.data ?? response.data;
    if (user?.id) return withRole(user, tokenUser.role);
  } catch (error) {
    if (!isAxiosError(error) || (error.response?.status !== 404 && error.response?.status !== 405)) throw error;
  }
  return meFromUsersApi(tokenUser);
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
