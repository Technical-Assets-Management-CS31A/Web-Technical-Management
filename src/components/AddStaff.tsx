import React, { useState } from 'react';
import "../../public/css/addStaff.css"

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
                <div className="form-wrap">
                    <div className="item-form-container">
                        <button className="close-btn" onClick={() => setIsAddStaffFormOpen((prev) => !prev)}>
                            ×
                        </button>
                        <h2>Add New Staff</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstname" className="required">First Name</label>
                                    <input
                                        type="text"
                                        id="firstname"
                                        name="firstname"
                                        className="item-input"
                                        value={formData.firstname}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter first name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastname" className="required">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastname"
                                        name="lastname"
                                        className="item-input"
                                        value={formData.lastname}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="role" className="required">Role</label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="item-input"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="intern">Intern</option>
                                        <option value="regular">Regular</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status" className="required">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="item-input"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit">
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

