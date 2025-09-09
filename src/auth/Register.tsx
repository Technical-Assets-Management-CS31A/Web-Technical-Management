import React, { useState } from "react"
import { FaPlus } from "react-icons/fa6";
import "../../public/css/register.css"
import type { TRegisterUser } from "../types/types";

export default function Register() {
    const register_api = import.meta.env.VITE_REGISTER_USER_API;
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isRegisterFormOpen, setIsRegisterFormOpen] = useState<boolean>(true)
    const [firstNameError, setFirstNameError] = useState<string>("")
    const [lastNameError, setLastNameError] = useState<string>("")
    const [usernameError, setUsernameError] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")
    const [submitForm, setSubmitForm] = useState<TRegisterUser>({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        confirmPassword: ""
    });


    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSubmitForm((prev) => ({ ...prev, [name]: value }))

        if (name === "firstName") setFirstNameError("")
        if (name === "lastName") setLastNameError("")
        if (name === "username") setUsernameError("")
        if (name === "password") setPasswordError("")

        if (name === "confirmPassword") setConfirmPasswordError("")
    }

    // Handle Register User
    const handleSubmitRegisterForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (submitForm.firstName == "" && submitForm.lastName == "" && submitForm.username == "" && submitForm.password == "" && submitForm.confirmPassword == "") {
            setFirstNameError("Firstname is required");
            setLastNameError("Lastname is required");
            setUsernameError("Username is required");
            setPasswordError("Password is required");
            setConfirmPasswordError("Confirm password is required");
            setIsSubmitting(false);
            return;
        }

        if (submitForm.confirmPassword !== submitForm.password) {
            setConfirmPasswordError("Password does not match");
            setIsSubmitting(false);
            return;
        }

        try {
            const submitUserData = {
                firstName: submitForm.firstName,
                lastName: submitForm.lastName,
                username: submitForm.username,
                password: submitForm.password,
                confirmPassword: submitForm.confirmPassword,
            };

            const response = await fetch(register_api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitUserData),
            });

            if (!response.ok && response.status === 400) {
                setIsSubmitting(false);
                setUsernameError("Username already Exist");
                return
            }

            const data = await response.json();
            if (data) {
                setIsRegisterFormOpen(false);
                alert("Registration successful! You can now log in.");
                window.location.reload();
            }

            if (!response.ok) {
                throw data.errors || { general: "Registration failed" };
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error.message;
            }
            throw "An unknown error occurred";
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <>
            {isRegisterFormOpen ?

                <div className="register-page">
                    <div className="Register-container">
                        <form onSubmit={handleSubmitRegisterForm} className="register-form" method="post">
                            <div className="close-container">
                                <FaPlus onClick={() => setIsRegisterFormOpen(false)} className="close-logo" />
                            </div>
                            <div className="register-title">
                                <h1>Create account</h1>
                                <p>Register an admin account to manage the system.</p>
                            </div>
                            <input
                                autoFocus
                                style={{ borderColor: firstNameError ? "red" : "" }}
                                type="text"
                                name="firstName"
                                value={submitForm.firstName}
                                placeholder="First name"
                                onChange={handleChange}
                            />
                            {firstNameError && <p style={{ marginTop: "-1.1rem", color: "red", fontSize: "14px", }}>{firstNameError}</p>}

                            <input
                                type="text"
                                name="lastName"
                                style={{ borderColor: lastNameError ? "red" : "" }}
                                value={submitForm.lastName}
                                placeholder="Last name"
                                onChange={handleChange}
                            />
                            {lastNameError && <p style={{ marginTop: "-1.1rem", color: "red", fontSize: "14px", }}>{lastNameError}</p>}

                            <input
                                type="text"
                                name="username"
                                style={{ borderColor: usernameError ? "red" : "" }}
                                value={submitForm.username}
                                placeholder="Username"
                                onChange={handleChange}
                            />
                            {usernameError && <p style={{ marginTop: "-1.1rem", color: "red", fontSize: "14px", }}>{usernameError}</p>}

                            <input
                                type="password"
                                name="password"
                                style={{ borderColor: passwordError ? "red" : "" }}
                                value={submitForm.password}
                                placeholder="Password"
                                onChange={handleChange}
                            />
                            {passwordError && <p style={{ marginTop: "-1.1rem", color: "red", fontSize: "14px", }}>{passwordError}</p>}

                            <input
                                type="password"
                                name="confirmPassword"
                                style={{ borderColor: confirmPasswordError ? "red" : "" }}
                                value={submitForm.confirmPassword}
                                placeholder="Confirm password"
                                onChange={handleChange}
                            />
                            {confirmPasswordError && <p style={{ marginTop: "-1.1rem", color: "red", fontSize: "14px", }}>{confirmPasswordError}</p>}

                            <div className="register-container">
                                <button className="register-button" type="submit">
                                    {isSubmitting ? (<div className="loader-container">
                                        <div className="loader"></div>
                                    </div>) : "Register"}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
                : ""}
        </>
    )
}
