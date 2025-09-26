import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import logo from "../assets/img/aclcLogo.webp";
import type { TLoginUser } from "../types/types";
import { saveToken, getToken } from "../utils/token";

export default function Login() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_LOGIN_USER_API;
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState<boolean>(false);
  const [isForgotPasswordFormOpen, setIsForgotPasswordFormOpen] =
    useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [submitForm, setSubmitForm] = useState<TLoginUser>({
    username: "",
    password: "",
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      navigate("/home/dashboard");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubmitForm((prev) => ({ ...prev, [name]: value }));

    if (name === "username") setUsernameError("");
    if (name === "password") setPasswordError("");
  };

  const handleSubmitLoginForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (submitForm.username == "" && submitForm.password == "") {
      setUsernameError("Username is required");
      setPasswordError("Password is required");
      setIsSubmitting(false);
      return;
    } else if (submitForm.username == "" && submitForm.password) {
      setUsernameError("Username is required");
      setIsSubmitting(false);
      return;
    } else if (submitForm.password == "" && submitForm.username) {
      setPasswordError("Password is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const submitUserData = {
        username: submitForm.username,
        password: submitForm.password,
      };

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitUserData),
        credentials: "include",
      });
      if (!response.ok) {
        setUsernameError("Invalid username or password");
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();

      if (data) {
        saveToken(data.accessToken);
        navigate("/home/dashboard");
      }

      if (!response.ok) {
        throw data.errors || { general: "Login failed" };
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("Login error:", error.message);
        setIsSubmitting(false);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative w-full h-screen bg-[rgb(46,111,251)] max-lg:h-auto max-lg:min-h-screen max-lg:py-4">
        <div className="animate-fadeIn max-w-[10rem] p-5 ml-[3%] animate-fade-in max-sm:ml-0 max-sm:p-2 max-sm:max-w-full max-sm:text-center">
          <img
            src={logo}
            alt="Logo"
            className="w-[106px] h-[124px] max-sm:w-20 max-sm:h-[94px]"
          />
        </div>
        <div className="animate-fadeIn max-w-[1000px] mx-[4%] mt-[7%] mb-[4%] animate-fade-in max-lg:mx-[2%] max-lg:mt-[4%] max-lg:mb-[2%] max-lg:max-w-full max-sm:mx-[1%] max-sm:mt-[2%] max-sm:mb-[1%] max-sm:p-0">
          <div className="max-w-[650px] max-sm:max-w-full max-sm:text-center">
            <h1 className="text-[65px] text-white font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] leading-[4.2rem] m-0 mb-4 animate-fade-in max-sm:text-[2.2rem] max-sm:leading-[2.7rem]">
              Technical Assets Management
            </h1>
          </div>
          <p className="text-white/75 text-lg">
            Managing hardware, software, and digital resources, while tracking items, borrowers, and usage. Ensures optimized performance, cost efficiency, security, and smooth lifecycle management.
          </p>
        </div>
        <div className="animate-fadeIn absolute top-0 right-0 w-[35%] h-screen bg-white flex flex-col justify-center items-center animate-fade-in max-lg:w-full max-lg:ml-0 max-lg:relative max-lg:min-h-[60vh] max-sm:w-full max-sm:ml-0 max-sm:relative max-sm:min-h-[60vh] max-sm:py-4 max-sm:px-2">
          <div className="my-4 mb-10">
            <h1 className="text-black text-[2.4rem] m-0 mb-[-0.3rem] max-sm:text-[1.5rem]">
              Welcome Admin.
            </h1>
            <p className="mb-1.5 text-black/62 text-center">
              Enter your credentials to log in.
            </p>
          </div>
          <form
            className="flex flex-col justify-center items-center"
            onSubmit={handleSubmitLoginForm}
            method="post"
          >
            <div className="relative flex flex-col">
              <input
                className={`w-[400px] h-[55px] rounded-md outline-none border mb-8 border-black/34 bg-white/78 pl-4 text-base hover:bg-white/93 focus:bg-white/93 max-lg:w-[90vw] max-lg:max-w-[98%] max-lg:min-w-[220px] max-sm:w-[98vw] max-sm:max-w-full max-sm:min-w-[120px] max-sm:text-base ${usernameError ? "border-2 border-red-500" : ""}`}
                autoFocus
                type="text"
                name="username"
                placeholder="Username"
                value={submitForm.username}
                onChange={handleChange}
                data-testid="username"
              />
              {usernameError && (
                <p className="absolute mt-14 text-red-500 text-base">
                  {usernameError}
                </p>
              )}
            </div>
            <div className="relative flex flex-col">
              <input
                className={`w-[400px] h-[55px] rounded-md outline-none border border-black/34 bg-white/78 pl-4 text-base hover:bg-white/93 focus:bg-white/93 max-lg:w-[90vw] max-lg:max-w-[98%] max-lg:min-w-[220px] max-sm:w-[98vw] max-sm:max-w-full max-sm:min-w-[120px] max-sm:text-base ${usernameError ? "border-2 border-red-500" : ""}`}
                type={isShowPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={submitForm.password}
                onChange={handleChange}
                data-testid="password"
              />
              {passwordError && (
                <p className="relative text-red-500 text-base">
                  {passwordError}
                </p>
              )}
              <div className="absolute w-[10%] flex justify-center items-center float-right mt-3.5 ml-[22.5rem] max-lg:-mt-16 max-lg:ml-[80%] max-sm:-mt-14 max-sm:ml-[80%] max-sm:text-[1.2rem]">
                {isShowPassword ? (
                  <FaEye
                    className="text-[1.6rem] mr-4 text-gray-400 cursor-pointer"
                    onClick={() => setIsShowPassword((prev) => !prev)}
                  />
                ) : (
                  <FaEyeSlash
                    className="text-[1.6rem] mr-4 text-gray-400 cursor-pointer"
                    onClick={() => setIsShowPassword((prev) => !prev)}
                  />
                )}
              </div>
              <div className="absolute cursor-pointer mt-15 right-0 max-sm:justify-center max-sm:mt-4">
                <p
                  className="text-gray-400 font-normal hover:text-gray-700"
                  onClick={() => setIsForgotPasswordFormOpen(true)}
                >
                  Forgot Password ?
                </p>
              </div>
            </div>

            <div className="mt-20 max-sm:mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-[420px] h-[55px] outline-none border-0 rounded-md text-lg font-medium text-white bg-[rgb(46,111,251)] cursor-pointer hover:bg-[rgb(54,117,253)] disabled:opacity-50 max-lg:w-[90vw] max-lg:max-w-[98%] max-lg:min-w-[220px] max-sm:w-[98vw] max-sm:max-w-full max-sm:min-w-[120px] max-sm:text-base"
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-white animate-spin"></div>
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
          <div className="mt-6 max-sm:text-center max-sm:mt-4">
            <p
              className="text-gray-400 cursor-pointer text-lg hover:text-gray-700"
              onClick={() => setIsRegisterFormOpen(true)}
            >
              Create new account ?
            </p>
          </div>
        </div>
      </div>
      {isRegisterFormOpen ? <Register onClose={() => setIsRegisterFormOpen(false)} /> : ""}
      {isForgotPasswordFormOpen ? (
        <ForgotPassword onClose={() => setIsForgotPasswordFormOpen(false)} />
      ) : (
        ""
      )}
    </>
  );
}
