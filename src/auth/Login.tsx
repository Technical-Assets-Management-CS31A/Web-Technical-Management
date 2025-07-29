import { useState } from "react"
import "../../public/css/login.css"
import Register from "./Register"
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import logo from "../assets/img/aclcLogo.webp"

export default function Login() {
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isRegisterFormOpen, setIsRegisterFormOpen] = useState<boolean>(false)

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
                    <form className="form-credentials">
                        <input autoFocus type="text" name="username" placeholder="Username" />
                        <input type={isShowPassword ? "text" : "password"} name="password" placeholder="********" />
                        <div className="show-password">
                            {isShowPassword ? <FaEye className="open-eye" onClick={() => setIsShowPassword((prev) => !prev)} /> : <FaEyeSlash className="slash-eye" onClick={() => setIsShowPassword((prev) => !prev)} />}
                        </div>
                        <div className="forgot-password">
                            <p>Forgot Password ?</p>
                        </div>
                    </form>
                    <div className="submit-container">
                        <button type="submit">
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
