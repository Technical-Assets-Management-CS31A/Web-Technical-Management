import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

type ItemData = {
  serialNumber: string;
  image: File | null;
  itemName: string;
  itemType: string;
  itemModel: string;
  itemMake: string;
  description: string;
  category: string;
  condition: string;
};

const PostItem = async (formData: ItemData) => {
  const BASE_URL = import.meta.env.VITE_CREATE_ITEM_API;

  const body = new FormData();
  body.append("serialNumber", formData.serialNumber);
  body.append("itemName", formData.itemName);
  body.append("itemType", formData.itemType);
  body.append("itemModel", formData.itemModel);
  body.append("itemMake", formData.itemMake);
  body.append("description", formData.description);
  body.append("category", formData.category);
  body.append("condition", formData.condition);

  if (formData.image) {
    body.append("image", formData.image);
  }

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Submission failed");
  return data;
};

export const usePostItemMutation = () => {
  return useMutation({
    mutationKey: ["Item"],
    mutationFn: PostItem,
  });
};
