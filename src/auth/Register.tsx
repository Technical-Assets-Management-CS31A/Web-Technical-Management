import { useState } from "react"
import { FaPlus } from "react-icons/fa6";
import "../../public/css/register.css"

export default function Register() {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isRegisterFormOpen, setIsRegisterFormOpen] = useState<boolean>(true)
    return (
        <>
            {isRegisterFormOpen ?

                <div className="register-page">
                    <form className="Register-container">
                        <div className="close-container">
                            <FaPlus onClick={() => setIsRegisterFormOpen(false)} className="close-logo" />
                        </div>
                        <div className="register-title">
                            <h1>Create account</h1>
                            <p>Register an admin account to manage the system.</p>
                        </div>
                        <form className="register-form">
                            <input autoFocus type="text" name="first_name" placeholder="First name" />
                            <input type="text" name="last_name" placeholder="Last name" />
                            <input type="text" name="username" placeholder="Username" />
                            <input type="password" name="password" placeholder="Password" />
                            <input type="password" name="password" placeholder="Confirm password" />
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
