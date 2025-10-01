import { useMutation } from "@tanstack/react-query";
import { getToken } from "../../utils/token";

type updateItem = {
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
  Id: string;
  formData: updateItem;
};

const PatchItem = async ({ Id, formData }: PatchItemProps) => {
  const BASE_URL = import.meta.env.VITE_ITEM_PATCH;

  const body = new FormData();
  body.append("ItemMake", formData.itemMake);
  body.append("ItemType", formData.itemType);
  body.append("ItemModel", formData.itemModel);
  body.append("Condition", formData.condition);
  body.append("Description", formData.description);
  body.append("ItemName", formData.itemName);
  body.append("Category", formData.category);

  if (formData.image) {
    body.append("Image", formData.image);
  }

  const res = await fetch(`${BASE_URL}/${Id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: body,
  });

  const contentType = res.headers.get("content-type") || "";
  let data: unknown = null;

  if (res.status !== 204) {
    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (err: unknown) {
        console.log(err);
        data = null;
      }
    } else {
      const text = await res.text();
      data = text || null;
    }
  }

  if (!res.ok) {
    throw new Error("Update item failed");
  }

  return data;
};

export const usePatchItemMutation = () => {
  return useMutation({
    mutationKey: ["Item"],
    mutationFn: PatchItem,
  });
};
