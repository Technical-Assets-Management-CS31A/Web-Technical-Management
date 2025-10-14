import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";
import type { TUpdateUsers } from "../../types/types.ts";

type PatchUserProps = {
  id: string;
  formData: TUpdateUsers
}

const PatchUser = async ({ id, formData }: PatchUserProps) => {
  const updatedUser = JSON.stringify(formData);
  const res = await fetch(`http://localhost:5278/api/v1/users/staff/${id}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: updatedUser
  });
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Update user failed");
  console.log(data)
  
  return data;
}

export const usePatchUserMutation = () => {
  return useMutation({
    mutationKey: ["profile"],
    mutationFn: PatchUser
  })
}
