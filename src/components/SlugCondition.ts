import type { AssetCondition } from "../@types/types";

const CONDITION_CLASSES: Record<AssetCondition, string> = {
  GOOD: "bg-green-100 text-green-700",
  FAIR: "bg-yellow-100 text-yellow-700",
  DAMAGED: "bg-red-100 text-red-700",
};

export const SlugCondition = (condition: string | null | undefined) => {
  if (!condition) return "";
  return CONDITION_CLASSES[condition as AssetCondition] ?? "bg-gray-100 text-gray-700";
};
