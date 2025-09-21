import React, { useState } from "react";
import type { TItemForm } from "../types/types";
import CloseButton from "./CloseButton";
import { usePostItemMutation } from "../query/post/usePostItemMutation";
type AddItemFormProps = {
  onClose: () => void;
};

const AddItemForm = ({ onClose }: AddItemFormProps) => {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    }
  };

  const { mutate } = usePostItemMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
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
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  type="text"
                  id="ItemName"
                  name="ItemName"
                  placeholder="Enter item name"
                  value={formData.ItemName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="SerialNumber"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  type="text"
                  id="SerialNumber"
                  name="SerialNumber"
                  placeholder="Enter serial number"
                  value={formData.SerialNumber}
                  onChange={handleChange}
                  required
                />
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
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  id="Category"
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="tools">Tools</option>
                </select>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="Condition"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  id="Condition"
                  name="Condition"
                  value={formData.Condition}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
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
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  type="text"
                  id="ItemType"
                  name="ItemType"
                  placeholder="Enter item type"
                  value={formData.ItemType}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="ItemModel"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Item Model <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  type="text"
                  id="ItemModel"
                  name="ItemModel"
                  placeholder="Enter item model"
                  value={formData.ItemModel}
                  onChange={handleChange}
                  required
                />
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
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  type="text"
                  id="ItemMake"
                  name="ItemMake"
                  placeholder="Enter item make"
                  value={formData.ItemMake}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="Description"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                  type="text"
                  id="Description"
                  name="Description"
                  placeholder="Enter description"
                  value={formData.Description}
                  onChange={handleChange}
                  required
                />
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
                  className="w-full px-4 py-2 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base"
                  type="file"
                  id="Image"
                  name="Image"
                  accept="image/*"
                  onChange={handleChange}
                />
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
                className="px-8 py-3 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150 flex items-center gap-2"
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
