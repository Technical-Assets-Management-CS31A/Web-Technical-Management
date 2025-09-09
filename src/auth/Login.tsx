import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import "../../public/css/login.css"
import Register from "./Register"
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import logo from "../assets/img/aclcLogo.webp"
import type { TLoginUser } from "../types/types"
import { saveToken, getToken } from "../utils/token"

export default function Login() {
    const navigate = useNavigate();
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

    useEffect(() => {
        const token = getToken();
        if (token) {
            navigate("/home/dashboard");
        }
        navigate("/");

    }, [navigate]);

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
            if (!response.ok) {
                setUsernameError("Invalid username or password")
                setIsSubmitting(false)
                return
            }

            const data = await response.json()

            if (data) {
                saveToken(data.accessToken)
                navigate("/home/dashboard")
            }

            if (!response.ok) {
                throw data.errors || { general: "Login failed" }
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("Login error:", error.message)
                setIsSubmitting(false)
                return
            }
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
                    <form className="form-credentials" onSubmit={handleSubmitLoginForm} method="post">
                        <input autoFocus type="text" name="username" placeholder="Admin" value={submitForm.username} onChange={handleChange} />
                        {usernameError && <p style={{ marginTop: "-1.1rem", marginBottom: "1.2rem", color: "red", fontSize: "14px", }}>{usernameError}</p>}
                        <input type={isShowPassword ? "text" : "password"} name="password" placeholder="********" value={submitForm.password} onChange={handleChange} />
                        {passwordError && <p style={{ marginTop: "-1.1rem", marginBottom: "1.2rem", color: "red", fontSize: "14px", }}>{passwordError}</p>}
                        <div className="show-password">
                            {isShowPassword ? <FaEye className="open-eye" onClick={() => setIsShowPassword((prev) => !prev)} /> : <FaEyeSlash className="slash-eye" onClick={() => setIsShowPassword((prev) => !prev)} />}
                        </div>
                        <div className="forgot-password">
                            <p>Forgot Password ?</p>
                        </div>
                        <div className="submit-container">
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (<div className="loader-container">
                                    <div className="login-loader"></div>
                                </div>) : "Login"}
                            </button>
                        </div>
                    </form>
                    <div className="create-admin-account">
                        <p onClick={() => setIsRegisterFormOpen((prev) => !prev)}>Create admin account ?</p>
                    </div>
                </div>
            </div>
            {isRegisterFormOpen ? <Register /> : ""}
        </>
    )
}
