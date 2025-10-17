import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

type updateItem = {
  serialNumber: string,
  image: File | null;
  itemName: string;
  itemType: string;
  itemModel: string;
  itemMake: string;
  description: string;
  category: string;
  condition: string;
};

type PatchItemProps = {
  id: string;
  formData: updateItem;
};

const PatchItem = async ({ id, formData }: PatchItemProps) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const END_POINT = "/api/v1/items";

  const body = new FormData();
  body.append("ItemMake", formData.itemMake);
  body.append("SerialNumber", formData.serialNumber);
  body.append("ItemType", formData.itemType);
  body.append("ItemModel", formData.itemModel);
  body.append("Condition", formData.condition);
  body.append("Description", formData.description);
  body.append("ItemName", formData.itemName);
  body.append("Category", formData.category);
  if (formData.image) {
    body.append("Image", formData.image);
  }

  const res = await fetch(`${BASE_URL}${END_POINT}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: body,
  });


  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) throw new Error(data.message || "Update item failed");

  return data;
};

export const usePatchItemMutation = () => {
  return useMutation({
    mutationKey: ["items"],
    mutationFn: PatchItem,
  });
};
