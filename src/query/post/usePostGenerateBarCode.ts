import { useMutation } from "@tanstack/react-query";

const generateBarCode = async (Id: string) => {
  const BASE_URL = import.meta.env.VITE_GENERATE_BARCODE_API;
  const res = await fetch(`${BASE_URL}/${Id}`, {
    method: "POST",
    body: Id,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to generate barcode");
  }
  console.log(data);
  return data;
};

export const usePostGenerateBarCode = () => {
  return useMutation({
    mutationKey: ["barcode"],
    mutationFn: generateBarCode,
  });
};
