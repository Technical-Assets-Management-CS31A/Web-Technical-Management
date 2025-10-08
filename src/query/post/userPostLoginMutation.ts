// import { useMutation } from "@tanstack/react-query";
// import type { TLoginUser } from "../../types/types";

// const LoginUser = async (formData: TLoginUser) => {
//   const BASE_URL = import.meta.env.VITE_LOGIN_USER_API;
//   const res = await fetch(BASE_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(formData),
//     credentials: "include",
//   });
//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data.message || "Failed to login user");
//   }
//   console.log(data)

//   return data;
// };

// export const usePostLoginMutation = () => {
//   return useMutation({
//     mutationKey: ["login"],
//     mutationFn: LoginUser,
//   });
// };
//AI GENERATED
import { useMutation } from "@tanstack/react-query";
// --- FIX #1: Import the user type as a type-only import ---
import type { TLoginUser, TUsers } from "../../types/types";

// The function now has a return type of Promise<TUsers>
const LoginUser = async (formData: TLoginUser): Promise<TUsers> => {
  const BASE_URL = import.meta.env.VITE_LOGIN_USER_API;

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
    credentials: "include", // This is correct!
  });

  // Always parse the JSON response first, whether it's an error or success.
  const apiResponse = await res.json();

  // --- FIX #2: Correctly handle errors ---
  if (!res.ok) {
    // Our C# backend sends the error in a property called 'Message' (capital M).
    throw new Error(apiResponse.Message || "Failed to login user");
  }

  // --- FIX #3: Return ONLY the nested user data on success ---
  // This is the user object that our AuthContext and onSuccess callback will receive.
  return apiResponse.data;
};

export const usePostLoginMutation = () => {
  // Add types to useMutation for better autocompletion and safety in your components.
  // It follows the pattern: useMutation<TData, TError, TVariables>
  return useMutation<TUsers, Error, TLoginUser>({
    mutationKey: ["login"],
    mutationFn: LoginUser,
  });
};