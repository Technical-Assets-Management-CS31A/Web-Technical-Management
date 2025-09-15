import React, { useState } from 'react';

interface StaffFormData {
    firstname: string;
    lastname: string;
    role: 'intern' | 'regular';
    status: 'active' | 'inactive';
}

export const AddStaff = () => {
    const [isAddStaffFormOpen, setIsAddStaffFormOpen] = useState<boolean>(true)
    const [formData, setFormData] = useState<StaffFormData>({
        firstname: '',
        lastname: '',
        role: 'intern',
        status: 'active'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Staff data:', formData);
    };

    return (
        <>
            {isAddStaffFormOpen &&
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative animate-fadeInUp">
                        <button
                            className="absolute top-4 right-4 text-2xl text-[#64748b] hover:text-[#2563eb] transition-colors"
                            onClick={() => setIsAddStaffFormOpen((prev) => !prev)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <h2 className="text-3xl font-extrabold text-[#1e293b] mb-6 text-center tracking-tight">Add New Staff</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="firstname" className="block text-[#2563eb] font-semibold mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="firstname"
                                        name="firstname"
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        value={formData.firstname}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="lastname" className="block text-[#2563eb] font-semibold mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="lastname"
                                        name="lastname"
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        value={formData.lastname}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="role" className="block text-[#2563eb] font-semibold mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="intern">Intern</option>
                                        <option value="regular">Regular</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="status" className="block text-[#2563eb] font-semibold mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-center pt-2">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150"
                                >
                                    Add Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            }
        </>
    );
};