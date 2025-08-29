import { useState } from "react"
import "../../public/css/login.css"
import Register from "./Register"
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import logo from "../assets/img/aclcLogo.webp"
import type { TLoginUser } from "../types/types"
import { saveToken } from "../utils/token"

export default function Login() {
    const login_api = import.meta.env.VITE_LOGIN_USER_API;
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isRegisterFormOpen, setIsRegisterFormOpen] = useState<boolean>(false)
    const [usernameError, setUsernameError] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")
    const [submitForm, setSubmitForm] = useState<TLoginUser>({
        username: "",
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSubmitForm((prev) => ({ ...prev, [name]: value }))

        if (name === "username") setUsernameError("")
        if (name === "password") setPasswordError("")
    }

    const handleSubmitLoginForm = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        if (submitForm.username == "" && submitForm.password == "") {
            setUsernameError("Username is required")
            setPasswordError("Password is required")
            setIsSubmitting(false)
            return
        }

        try {
            const submitUserData = {
                username: submitForm.username,
                password: submitForm.password,
            }

            const response = await fetch(login_api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitUserData),
            })

            const data = await response.json()

            if (data) {
                saveToken(data.access_token)
                return console.log(data)
            }

            if (!response.ok) {
                throw data.errors || { general: "Login failed" }
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error.message
            }
            throw "An unknown error occurred"
        } finally {
            setIsSubmitting(false)
        }

    }
    return (
        <>
            <div className="login-container">
                <div className="image-container">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="hero-container">
                    <div className="title">
                        <h1>Technical Assets Management</h1>
                    </div>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor earum illum quaerat, cum, minima iusto nihil nobis molestiae id voluptate voluptatem ducimus alias aperiam, voluptatibus perferendis repellat error omnis. Asperiores!</p>
                </div>
                <div className="form-container">
                    <div className="form-header">
                        <h1>Welcome back.</h1>
                        <p>Enter your credentials to log in.</p>
                    </div>
                    <form className="form-credentials" onSubmit={handleSubmitLoginForm}>
                        <input autoFocus type="text" name="username" placeholder="Admin" value={submitForm.username} onChange={handleChange} />
                        {usernameError && <p className="error-message">{usernameError}</p>}
                        <input type={isShowPassword ? "text" : "password"} name="password" placeholder="********" value={submitForm.password} onChange={handleChange} />
                        {passwordError && <p className="error-message">{passwordError}</p>}
                        <div className="show-password">
                            {isShowPassword ? <FaEye className="open-eye" onClick={() => setIsShowPassword((prev) => !prev)} /> : <FaEyeSlash className="slash-eye" onClick={() => setIsShowPassword((prev) => !prev)} />}
                        </div>
                        <div className="forgot-password">
                            <p>Forgot Password ?</p>
                        </div>
                    </form>
                    <div className="submit-container">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (<div className="loader-container">
                                <div className="loader"></div>
                            </div>) : "Login"}
                        </button>
                    </div>
                    <div className="create-admin-account">
                        <p onClick={() => setIsRegisterFormOpen((prev) => !prev)}>Create admin account ?</p>
                    </div>
                </div>
            </div>
            {isRegisterFormOpen ? <Register /> : ""}
        </>
    )
}
