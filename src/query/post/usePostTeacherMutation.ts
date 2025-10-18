import { useMutation } from "@tanstack/react-query";
import type { TTeacherFormData } from "../../types/types";
import { getToken } from "../../utils/token";

type PostTeacherProps = {
  formData: TTeacherFormData
}

const PostTeacher = async ({ formData }: PostTeacherProps) => {
  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const END_POINT = "";

    const newUserData = JSON.stringify(formData)
    const res = await fetch(`${BASE_URL}${END_POINT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: newUserData,
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data.message;

  } catch (error) {
    console.log(error);
  }
};

export const usePostTeacherMutation = () => {
  return useMutation({
    mutationKey: ["create-teacher"],
    mutationFn: PostTeacher,
  });
};
