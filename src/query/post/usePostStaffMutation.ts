import { useMutation } from "@tanstack/react-query";
import type { TStaffFormData } from "../../types/types";
import { getToken } from "../../utils/token";

const PostStaff = async (formData: TStaffFormData) => {
  const BASE_URL = import.meta.env.VITE_ADD_STAFF_API;
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
};

export const usePostStaffMutation = () => {
  return useMutation({
    mutationKey: ["register-staff"],
    mutationFn: PostStaff,
  });
};
