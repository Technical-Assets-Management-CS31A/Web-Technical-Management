import { useMutation } from "@tanstack/react-query";
import type { TStudentFormData } from "../../types/types";
import { getToken } from "../../utils/token";

type PostStudentProps = {
  formData: TStudentFormData
}

const PostStudent = async ({ formData }: PostStudentProps) => {
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

export const usePostStudentMutation = () => {
  return useMutation({
    mutationKey: ["create-student"],
    mutationFn: PostStudent,
  });
};
