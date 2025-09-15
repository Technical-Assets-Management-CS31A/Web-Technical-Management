import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import type { TItemForm } from "../types/types";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "../utils/token";

const AddItemForm = () => {
    const [isAddItemFormOpen, setIsAddItemFormOpen] = useState<boolean>(true);

    const [formData, setFormData] = useState<TItemForm>({
        image: null as File | null,
        preview: "",
        name: "",
        serial_number: "",
        category: "",
        stock: "",
        condition: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, files } = e.target as HTMLInputElement;
        if (files && files[0]) {
            setFormData((prev) => ({
                ...prev,
                image: files[0],
                preview: URL.createObjectURL(files[0]),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Submit item
    const submitItem = async (formData: TItemForm) => {
        const BASE_URL = import.meta.env.VITE_ADD_ITEM_API;
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Submission failed');
        return res.json();
    };

    // Set up mutation
    const { mutate, isError, error } = useMutation({
        mutationFn: submitItem,
        onSuccess: (data) => {
            console.log('Submitted:', data);
        },
    });

    if (isError) console.log(isError)
    if (error) console.log(error)

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(formData);
    };

    return (
        <>
            {isAddItemFormOpen &&
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeInUp">
                        <button
                            className="absolute top-4 right-4 text-2xl text-[#64748b] hover:text-[#2563eb] transition-colors"
                            onClick={() => setIsAddItemFormOpen((prev) => !prev)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <h2 className="text-3xl font-extrabold text-[#1e293b] mb-6 text-center tracking-tight">Add New Item</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="name" className="block text-[#2563eb] font-semibold mb-1">
                                        Item Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Enter item name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="serial_number" className="block text-[#2563eb] font-semibold mb-1">
                                        Serial Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        type="text"
                                        id="serial_number"
                                        name="serial_number"
                                        placeholder="Enter serial number"
                                        value={formData.serial_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="category" className="block text-[#2563eb] font-semibold mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        id="category"
                                        name="category"
                                        value={formData.category}
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
                                    <label htmlFor="condition" className="block text-[#2563eb] font-semibold mb-1">
                                        Condition <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        id="condition"
                                        name="condition"
                                        value={formData.condition}
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
                                    <label htmlFor="stock" className="block text-[#2563eb] font-semibold mb-1">
                                        Stock <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        type="number"
                                        id="stock"
                                        name="stock"
                                        min="0"
                                        placeholder="Enter stock count"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="image" className="block text-[#2563eb] font-semibold mb-1">
                                        Item Image
                                    </label>
                                    <input
                                        className="w-full px-4 py-2 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base"
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                    {formData.preview && (
                                        <div className="mt-2 flex justify-center">
                                            <img src={formData.preview} alt="Preview" className="h-24 rounded-xl shadow" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center pt-2">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150 flex items-center gap-2"
                                >
                                    <FaPlus /> Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            }
        </>
    );
};

export default AddItemForm;