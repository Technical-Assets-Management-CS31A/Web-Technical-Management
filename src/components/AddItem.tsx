import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import "../../public/css/addItem.css";
import type { TItemForm } from "../types/types";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "../utils/token";

const ItemForm = () => {
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
        <div className="form-wrap">
            <div className="item-form-container">
                <h2>Add Item</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Item Name</label>
                            <input
                                className="item-input"
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter item name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="serial">Serial Number</label>
                            <input
                                className="item-input"
                                type="text"
                                id="serial"
                                name="serial"
                                placeholder="Enter serial number"
                                value={formData.serial_number}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                className="item-input"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                <option value="electronics">Electronics</option>
                                <option value="furniture">Furniture</option>
                                <option value="tools">Tools</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="condition">Condition</label>
                            <select
                                className="item-input"
                                id="condition"
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                            >
                                <option value="">Select Condition</option>
                                <option value="new">New</option>
                                <option value="used">Used</option>
                                <option value="refurbished">Refurbished</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="stock">Stock</label>
                        <input
                            className="item-input"
                            type="number"
                            id="stock"
                            name="stock"
                            min="0"
                            placeholder="Enter stock count"
                            value={formData.stock}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group image-upload">
                        <label htmlFor="image">Image</label>
                        <input
                            className="item-input"
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                        />
                        {formData.preview && (
                            <div className="preview">
                                <img src={formData.preview} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit">
                            <FaPlus /> Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default ItemForm;
