import React, { useState } from "react";
import type { TStudentFormData } from "../types/types";
import CloseButton from "./CloseButton";
import { SuccessAlert } from "./SuccessAlert";
import { usePostStudentMutation } from "../query/post/usePostStudentMutation";

type AddStudentProps = {
    onClose: () => void;
};

export const AddStudent = ({ onClose }: AddStudentProps) => {
    const [firstnameError, setFirstnameError] = useState<string>("");
    const [lastnameError, setLastnameError] = useState<string>("");
    const [middlenameError, setMiddlenameError] = useState<string>("");
    const [studentIdNumberError, setStudentIdNumberError] = useState<string>("");
    const [courseError, setCourseError] = useState<string>("");
    const [sectionError, setSectionError] = useState<string>("");
    const [yearError, setYearError] = useState<string>("");
    const [streetError, setStreetError] = useState<string>("");
    const [provinceError, setProvinceError] = useState<string>("");
    const [postalCodeError, setPostalCodeError] = useState<string>("");
    const [cityMunicipalityError, setCityMunicipalityError] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [formData, setFormData] = useState<TStudentFormData>({
        FirstName: "",
        MiddleName: "",
        LastName: "",
        StudentIdNumber: "",
        Course: "",
        Section: "",
        Year: "",
        Street: "",
        Province: "",
        PostalCode: "",
        CityMunicipality: ""
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "FirstName") return setFirstnameError("");
        if (name === "LastName") return setLastnameError("");
        if (name === "MiddleName") return setMiddlenameError("");
        if (name === "StudentIdNumber") return setStudentIdNumberError("");
        if (name === "Course") return setCourseError("");
        if (name === "Section") return setSectionError("");
        if (name === "Year") return setYearError("");
        if (name === "Street") return setStreetError("");
        if (name === "Province") return setProvinceError("");
        if (name === "PostalCode") return setPostalCodeError("");
        if (name === "CityMunicipality") return setCityMunicipalityError("");

        setFirstnameError("");
        setLastnameError("");
        setMiddlenameError("");
        setStudentIdNumberError("");
        setCourseError("");
        setSectionError("");
        setYearError("");
        setStreetError("");
        setProvinceError("");
        setPostalCodeError("");
        setCityMunicipalityError("");
    };

    const { mutate } = usePostStudentMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Student data:", formData);

        let hasError = false;

        if (
            !formData.FirstName &&
            !formData.LastName &&
            !formData.StudentIdNumber &&
            !formData.Course &&
            !formData.Section &&
            !formData.Year &&
            !formData.Street &&
            !formData.Province &&
            !formData.PostalCode &&
            !formData.CityMunicipality
        ) {
            setFirstnameError("First name is required");
            setLastnameError("Last name is required");
            setStudentIdNumberError("Student ID number is required");
            setCourseError("Course is required");
            setSectionError("Section is required");
            setYearError("Year is required");
            setStreetError("Street is required");
            setProvinceError("Province is required");
            setPostalCodeError("Postal code is required");
            setCityMunicipalityError("City/municipality is required");
            hasError = true;
        }

        if (!formData.FirstName) {
            setFirstnameError("First name is required");
            hasError = true;
        }

        if (!formData.LastName) {
            setLastnameError("Last name is required");
            hasError = true;
        }

        if (!formData.StudentIdNumber) {
            setStudentIdNumberError("Student ID number is required");
            hasError = true;
        }

        if (!formData.Course) {
            setCourseError("Course is required");
            hasError = true;
        }

        if (!formData.Section) {
            setSectionError("Section is required");
            hasError = true;
        }

        if (!formData.Year) {
            setYearError("Year is required");
            hasError = true;
        }

        if (!formData.Street) {
            setStreetError("Street is required");
            hasError = true;
        }

        if (!formData.Province) {
            setProvinceError("Province is required");
            hasError = true;
        }

        if (!formData.PostalCode) {
            setPostalCodeError("Postal code is required");
            hasError = true;
        }

        if (!formData.CityMunicipality) {
            setCityMunicipalityError("City/municipality is required");
            hasError = true;
        }

        if (hasError) return;

        // Convert to TStudentFormData format for the API
        const studentData: TStudentFormData = {
            FirstName: formData.FirstName,
            LastName: formData.LastName,
            MiddleName: formData.MiddleName,
            StudentIdNumber: formData.StudentIdNumber,
            Course: formData.Course,
            Section: formData.Section,
            Year: formData.Year,
            Street: formData.Street,
            Province: formData.Province,
            PostalCode: formData.PostalCode,
            CityMunicipality: formData.CityMunicipality,
        };
        mutate({ formData: studentData }, {
            onSuccess: () => {
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                    onClose();
                    window.location.reload();
                }, 1000);
            },
            onError: (error) => {
                console.log(error);
            }
        });
    };

    return (
        <>
            <div className="fixed animate-fadeIn inset-0 z-50 flex items-center justify-center bg-gray-900/60">
                {showAlert && <SuccessAlert message={"Student Created Successfully"} />}
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl relative animate-fadeInUp">
                    <button
                        className="absolute top-4 right-4 text-2xl text-[#64748b] hover:text-[#2563eb] transition-colors"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <CloseButton onClick={onClose} />
                    </button>
                    <h2 className="text-3xl font-extrabold text-[#1e293b] mb-6 text-center tracking-tight">
                        New Student Registration
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="FirstName"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="FirstName"
                                    name="FirstName"
                                    className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${formData.FirstName === "" && firstnameError
                                        ? "border-red-500"
                                        : firstnameError
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                    value={formData.FirstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter first name"
                                    data-testid="firstName"
                                />
                                {firstnameError && (
                                    <p className="text-red-500 text-sm mt-1">{firstnameError}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="LastName"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="LastName"
                                    name="LastName"
                                    className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${formData.LastName === "" && lastnameError
                                        ? "border-red-500"
                                        : lastnameError
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                    value={formData.LastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter last name"
                                    data-testid="lastName"
                                />
                                {lastnameError && (
                                    <p className="text-red-500 text-sm mt-1">{lastnameError}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="MiddleName"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Middle Name{" "}
                                    <span className="text-gray-400/50">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="MiddleName"
                                    name="MiddleName"
                                    className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${formData.MiddleName === "" && middlenameError
                                        ? "border-red-500"
                                        : middlenameError
                                            ? "border-red-500"
                                            : ""
                                        }`}
                                    value={formData.MiddleName}
                                    onChange={handleInputChange}
                                    placeholder="Enter middle name"
                                    data-testid="middleName"
                                />
                                {middlenameError && (
                                    <p className="text-red-500 text-sm mt-1">{middlenameError}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="StudentIdNumber"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Student ID Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="StudentIdNumber"
                                    name="StudentIdNumber"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.StudentIdNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2024-00001"
                                    data-testid="studentIdNumber"
                                />
                                {studentIdNumberError && (
                                    <p className="text-red-500 text-sm mt-1">{studentIdNumberError}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="Course"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Course/Program <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="Course"
                                    name="Course"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.Course}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Computer Science"
                                    data-testid="course"
                                />
                                {courseError && (
                                    <p className="text-red-500 text-sm mt-1">{courseError}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="Section"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="Section"
                                    name="Section"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.Section}
                                    onChange={handleInputChange}
                                    placeholder="e.g., A, B, C"
                                    data-testid="section"
                                />
                                {sectionError && (
                                    <p className="text-red-500 text-sm mt-1">{sectionError}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="Year"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Year Level
                                </label>
                                <select
                                    id="Year"
                                    name="Year"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.Year}
                                    onChange={handleInputChange}
                                    data-testid="year"
                                >
                                    <option value="">Select Year Level</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="5th Year">5th Year</option>
                                </select>
                                {yearError && (
                                    <p className="text-red-500 text-sm mt-1">{yearError}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="Street"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    id="Street"
                                    name="Street"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.Street}
                                    onChange={handleInputChange}
                                    placeholder="Enter street address"
                                    data-testid="street"
                                />
                                {streetError && (
                                    <p className="text-red-500 text-sm mt-1">{streetError}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="CityMunicipality"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    City/Municipality
                                </label>
                                <input
                                    type="text"
                                    id="CityMunicipality"
                                    name="CityMunicipality"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.CityMunicipality}
                                    onChange={handleInputChange}
                                    placeholder="Enter city/municipality"
                                    data-testid="cityMunicipality"
                                />
                                {cityMunicipalityError && (
                                    <p className="text-red-500 text-sm mt-1">{cityMunicipalityError}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="Province"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Province
                                </label>
                                <input
                                    type="text"
                                    id="Province"
                                    name="Province"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.Province}
                                    onChange={handleInputChange}
                                    placeholder="Enter province"
                                    data-testid="province"
                                />
                                {provinceError && (
                                    <p className="text-red-500 text-sm mt-1">{provinceError}</p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="PostalCode"
                                    className="block text-[#2563eb] font-semibold mb-1"
                                >
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    id="PostalCode"
                                    name="PostalCode"
                                    className="w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg"
                                    value={formData.PostalCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter postal code"
                                    data-testid="postalCode"
                                />
                                {postalCodeError && (
                                    <p className="text-red-500 text-sm mt-1">{postalCodeError}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center pt-2">
                            <button
                                type="submit"
                                className="px-8 py-3  bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150 cursor-pointer"
                                data-testid="button-student"
                            >
                                Register Student
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
