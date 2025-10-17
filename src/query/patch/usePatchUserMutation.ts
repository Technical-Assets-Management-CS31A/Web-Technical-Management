import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

type PathUserCredentials = {
  username: string,
  email: string,
  phoneNumber: string,
  lastName: string,
  middleName: string,
  firstName: string,
  position: string
}

type PatchUserProps = {
  formData: PathUserCredentials
}

const PatchUser = async ({ formData }: PatchUserProps) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const END_POINT = "/api/v1/users/profile/technical";

  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated. Please log in again.");
  }

  const updatedUser = JSON.stringify(formData);

  const res = await fetch(`${BASE_URL}${END_POINT}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: updatedUser
  });

  if (res.status === 204) {
    return null;
  }

  let data: unknown = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const text = await res.text();
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    const getMessage = () => {
      if (typeof data === "string") return data;
      if (data && typeof data === "object") {
        const maybeMessage = (data as Record<string, unknown>)["message"];
        const maybeError = (data as Record<string, unknown>)["error"];
        if (typeof maybeMessage === "string") return maybeMessage;
        if (typeof maybeError === "string") return maybeError;
      }
      return undefined;
    };
    const message = getMessage() || `Update user failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const usePatchUserMutation = () => {
  return useMutation({
    mutationKey: ["profile"],
    mutationFn: PatchUser
  })
}
