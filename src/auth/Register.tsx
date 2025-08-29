import React, { useState } from "react"
import { FaPlus } from "react-icons/fa6";
import "../../public/css/register.css"
import type { TRegisterUser } from "../types/types";
import { saveToken } from "../utils/token";

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
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        confirm_password: ""
    });


    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSubmitForm((prev) => ({ ...prev, [name]: value }))

        if (name === "first_name") setFirstNameError("")
        if (name === "last_name") setLastNameError("")
        if (name === "username") setUsernameError("")
        if (name === "password") setPasswordError("")
        if (name === "confirm_password") setConfirmPasswordError("")
    }

    // Handle Register User
    const handleSubmitRegisterForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (submitForm.first_name == "" && submitForm.last_name == "" && submitForm.username == "" && submitForm.password == "" && submitForm.confirm_password == "") {
            setFirstNameError("Firstname is required");
            setLastNameError("Lastname is required");
            setUsernameError("Username is required");
            setPasswordError("Password is required");
            setConfirmPasswordError("Confirm password is required");
            setIsSubmitting(false);
            return;
        }

        try {
            const submitUserData = {
                first_name: submitForm.first_name,
                last_name: submitForm.last_name,
                username: submitForm.username,
                password: submitForm.password,
            };

            const response = await fetch(register_api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitUserData),
            });

            const data = await response.json();
            if (data) {
                saveToken(data.access_token)
                return console.log(data)
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
                    <form onSubmit={handleSubmitRegisterForm} className="Register-container">
                        <div className="close-container">
                            <FaPlus onClick={() => setIsRegisterFormOpen(false)} className="close-logo" />
                        </div>
                        <div className="register-title">
                            <h1>Create account</h1>
                            <p>Register an admin account to manage the system.</p>
                        </div>
                        <form className="register-form">
                            <input
                                autoFocus
                                style={{ borderColor: firstNameError ? "red" : "" }}
                                type="text"
                                name="first_name"
                                value={submitForm.first_name}
                                placeholder="First name"
                                onChange={handleChange}
                            />
                            {firstNameError && <p style={{ marginTop: "-0.1rem", color: "red", fontSize: "14px", }}>{firstNameError}</p>}

                            <input
                                type="text"
                                name="last_name"
                                style={{ borderColor: lastNameError ? "red" : "" }}
                                value={submitForm.last_name}
                                placeholder="Last name"
                                onChange={handleChange}
                            />
                            {lastNameError && <p style={{ marginTop: "-0.1rem", color: "red", fontSize: "14px", }}>{lastNameError}</p>}

                            <input
                                type="text"
                                name="username"
                                style={{ borderColor: usernameError ? "red" : "" }}
                                value={submitForm.username}
                                placeholder="Username"
                                onChange={handleChange}
                            />
                            {usernameError && <p style={{ marginTop: "-0.1rem", color: "red", fontSize: "14px", }}>{usernameError}</p>}

                            <input
                                type="password"
                                name="password"
                                style={{ borderColor: passwordError ? "red" : "" }}
                                value={submitForm.password}
                                placeholder="Password"
                                onChange={handleChange}
                            />
                            {passwordError && <p style={{ marginTop: "-0.1rem", color: "red", fontSize: "14px", }}>{passwordError}</p>}

                            <input
                                type="password"
                                name="confirm_password"
                                style={{ borderColor: confirmPasswordError ? "red" : "" }}
                                value={submitForm.confirm_password}
                                placeholder="Confirm password"
                                onChange={handleChange}
                            />
                            {confirmPasswordError && <p style={{ marginTop: "-0.1rem", color: "red", fontSize: "14px", }}>{confirmPasswordError}</p>}

                        </form>
                        <div className="register-container">
                            <button className="register-button" type="submit">
                                {isSubmitting ? (<div className="loader-container">
                                    <div className="loader"></div>
                                </div>) : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
                : ""}
        </>
    )
}
