import React, { useState } from "react";
import type { TItemForm } from "../types/types";
import CloseButton from "./CloseButton";
import { usePostItemMutation } from "../query/post/usePostItemMutation";
type AddItemFormProps = {
  onClose: () => void;
};

const AddItemForm = ({ onClose }: AddItemFormProps) => {
  const [itemNameError, setItemNameError] = useState<string>("");
  const [itemTypeError, setItemTypeError] = useState<string>("");
  const [itemModelError, setItemModelError] = useState<string>("");
  const [serialNumberError, setSerialNumberError] = useState<string>("");
  const [itemMakeError, setItemMakeError] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string>("");
  const [conditionError, setConditionError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TItemForm>({
    ItemName: "",
    SerialNumber: "",
    Image: null,
    ItemType: "",
    ItemModel: "",
    ItemMake: "",
    Description: "",
    Category: "",
    Condition: "",
    preview: "",
  });

  const { mutate } = usePostItemMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        Image: files[0],
        preview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === "ItemName") setItemNameError("");
      if (name === "SerialNumber") setSerialNumberError("");
      if (name === "Image") setImageError("");
      if (name === "ItemType") setItemTypeError("");
      if (name === "ItemMake") setItemMakeError("");
      if (name === "ItemModel") setItemModelError("");
      if (name === "Category") setCategoryError("");
      if (name === "Condition") setConditionError("");
      if (name === "Description") setDescriptionError("");
      if (name === "Image") setImageError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Item Data", formData);

    if (
      formData.ItemName === "" &&
      formData.SerialNumber === "" &&
      formData.Category === "" &&
      formData.Condition === "" &&
      formData.ItemType === "" &&
      formData.ItemModel === "" &&
      formData.ItemMake === "" &&
      formData.Description === "" &&
      formData.Image === null
    ) {
      setItemNameError("Item Name is required");
      setSerialNumberError("Serial Num is required");
      setImageError("Image is required");
      setItemTypeError("Item Type is required");
      setItemMakeError("Item Make is required");
      setItemModelError("Item Model is required");
      setCategoryError("Category is required");
      setConditionError("Condition is required");
      setDescriptionError("Description is required");
      return;
    }

    if (!formData.ItemName) {
      setItemNameError("Item Name is required");
      return;
    }

    if (!formData.SerialNumber) {
      setSerialNumberError("Serial Num is required");
      return;
    }

    if (!formData.Image) {
      setImageError("Image is required");
      return;
    }

    if (!formData.ItemType) {
      setItemTypeError("Item Type is required");
      return;
    }

    if (!formData.ItemMake) {
      setItemMakeError("Item Make is required");
      return;
    }

    if (!formData.ItemModel) {
      setItemModelError("Item Model is required");
      return;
    }

    if (!formData.Category) {
      setCategoryError("Category is required");
      return;
    }

    if (!formData.Condition) {
      setConditionError("Condition is required");
      return;
    }

    if (!formData.Description) {
      setDescriptionError("Description is required");
      return;
    }

    mutate(formData);

    setFormData({
      ItemName: "",
      SerialNumber: "",
      Category: "",
      Condition: "",
      ItemType: "",
      ItemModel: "",
      ItemMake: "",
      Description: "",
      Image: null,
      preview: "",
    });
  };

  return (
    <>
      <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative animate-fadeInUp">
          <button
            className="absolute top-4 right-4 text-2xl text-[#64748b] hover:text-[#2563eb] transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseButton onClick={onClose} />
          </button>
          <h2 className="text-3xl font-extrabold text-[#1e293b] mb-6 text-center tracking-tight">
            New Item
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="ItemName"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.ItemName === "" && itemNameError
                      ? "border-red-500"
                      : itemNameError
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  id="ItemName"
                  name="ItemName"
                  placeholder="Enter item name"
                  value={formData.ItemName}
                  onChange={handleChange}
                  data-testid="ItemName"
                />
                {itemNameError && (
                  <p className="text-red-500 text-sm mt-1">{itemNameError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="SerialNumber"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg" ${
                    formData.SerialNumber === "" && serialNumberError
                      ? "border-red-500"
                      : serialNumberError
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  id="SerialNumber"
                  name="SerialNumber"
                  placeholder="Enter serial number"
                  value={formData.SerialNumber}
                  onChange={handleChange}
                  data-testid="SerialNumber"
                />
                {serialNumberError && (
                  <p className="text-red-500 text-sm mt-1">
                    {serialNumberError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="Category"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg" ${
                    formData.Category === "" && categoryError
                      ? "border-red-500"
                      : categoryError
                      ? "border-red-500"
                      : ""
                  }`}
                  id="Category"
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  data-testid="Category"
                >
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="tools">Tools</option>
                </select>
                {categoryError && (
                  <p className="text-red-500 text-sm mt-1">{categoryError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="Condition"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.Condition === "" && conditionError
                      ? "border-red-500"
                      : conditionError
                      ? "border-red-500"
                      : ""
                  }`}
                  id="Condition"
                  name="Condition"
                  value={formData.Condition}
                  onChange={handleChange}
                  data-testid="Condition"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
                {conditionError && (
                  <p className="text-red-500 text-sm mt-1">{conditionError}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="ItemType"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Item Type <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.ItemType === "" && itemTypeError
                      ? "border-red-500"
                      : itemTypeError
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  id="ItemType"
                  name="ItemType"
                  placeholder="Enter item type"
                  value={formData.ItemType}
                  onChange={handleChange}
                  data-testid="ItemType"
                />
                {itemTypeError && (
                  <p className="text-red-500 text-sm mt-1">{itemTypeError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="ItemModel"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Item Model <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.ItemModel === "" && itemModelError
                      ? "border-red-500"
                      : itemModelError
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  id="ItemModel"
                  name="ItemModel"
                  placeholder="Enter item model"
                  value={formData.ItemModel}
                  onChange={handleChange}
                  data-testid="ItemModel"
                />
                {itemModelError && (
                  <p className="text-red-500 text-sm mt-1">{itemModelError}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="ItemMake"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Item Make <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.ItemMake === "" && itemMakeError
                      ? "border-red-500"
                      : itemMakeError
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  id="ItemMake"
                  name="ItemMake"
                  placeholder="Enter item make"
                  value={formData.ItemMake}
                  onChange={handleChange}
                  data-testid="ItemMake"
                />
                {itemMakeError && (
                  <p className="text-red-500 text-sm mt-1">{itemMakeError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="Description"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.Description === "" && descriptionError
                      ? "border-red-500"
                      : descriptionError
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  id="Description"
                  name="Description"
                  placeholder="Enter description"
                  value={formData.Description}
                  onChange={handleChange}
                  data-testid="Description"
                />
                {descriptionError && (
                  <p className="text-red-500 text-sm mt-1">
                    {descriptionError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col">
                <label
                  htmlFor="Image"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Item Image
                </label>
                <input
                  className={`w-full px-4 py-2 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${
                    formData.Image === null && imageError
                      ? "border-red-500"
                      : imageError
                      ? "border-red-500"
                      : ""
                  }`}
                  type="file"
                  id="Image"
                  name="Image"
                  accept="image/*"
                  onChange={handleChange}
                  data-testid="Image"
                />
                {imageError && (
                  <p className="text-red-500 text-sm mt-1">{imageError}</p>
                )}
                {formData.preview && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={formData.preview}
                      alt="Preview"
                      className="h-24 rounded-xl shadow"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150 flex items-center gap-2 cursor-pointer"
                data-testid="addItem-button"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddItemForm;
