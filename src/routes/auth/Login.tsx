import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import logo from "../../assets/newAclcLogo.webp";
import { isAxiosError } from "axios";
import type { LoginRequest, LoginResponse } from "../../@types/types";
import { useLogin } from "../../hooks/authHooks";
import { logoutUserApi } from "../../api/auth_api";
import { LOGIN_CONTENT as T } from "../../constants/loginContent";
import { setRefreshToken, setToken } from "../../utils/token";
import { getErrorMessage } from "../../components/form/FormKit";
import { isAccountRole } from "../../utils/usersData/userData";
import { resolveLoginRole } from "../../lib/loginRole";

export default function Login() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInactiveError, setIsInactiveError] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [submitForm, setSubmitForm] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const { mutate, isPending } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubmitForm((prev) => ({ ...prev, [name]: value }));
    if (name === "email") { setEmailError(""); setErrorMessage(""); setIsInactiveError(false); }
    if (name === "password") { setPasswordError(""); setErrorMessage(""); setIsInactiveError(false); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let hasError = false;
    if (!submitForm.email) { setEmailError(T.fields.email.required); hasError = true; }
    if (!submitForm.password) { setPasswordError(T.fields.password.required); hasError = true; }
    if (hasError) return;

    mutate(submitForm, {
      onSuccess: (res: LoginResponse) => {
        const accessToken = res?.accessToken;
        if (!accessToken) {
          setErrorMessage(T.errors.invalid);
          return;
        }
        const role = resolveLoginRole(res, accessToken);
        setToken(accessToken);
        if (res.refreshToken) setRefreshToken(res.refreshToken);

        // Staff-only web: anything other than a users-table role (e.g. a student) is signed straight
        // back out, which also clears the refresh-token cookie so the route guard can't revive it.
        if (!isAccountRole(role)) {
          logoutUserApi().catch(() => undefined);
          setErrorMessage(T.errors.staffOnly);
          setIsInactiveError(true);
          return;
        }

        // Instructors land on their own loans; staff and admins on the live board.
        navigate({ to: role === "INSTRUCTOR" ? "/home/loans" : "/home/dashboard" });
      },
      onError: (error) => {
        // 403 means the account exists but is INACTIVE
        if (isAxiosError(error) && error.response?.status === 403) {
          setErrorMessage(getErrorMessage(error, T.errors.inactive));
          setIsInactiveError(true);
        } else {
          // For all other errors (401, 500, etc.), show generic message
          setErrorMessage(T.errors.invalid);
          setIsInactiveError(false);
        }
      },
    });
  };

  const hasError = (field: "email" | "password") =>
    field === "email"
      ? !!emailError || !!errorMessage
      : !!passwordError || !!errorMessage;

  const year = new Date().getFullYear();

  const inputClass = (invalid: boolean) =>
    `peer w-full h-11 rounded-lg border bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 ${
      invalid
        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
        : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-blue-600/10"
    }`;

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex lg:w-[46%] xl:w-1/2 flex-col justify-between bg-blue-900 px-12 py-10 xl:px-16 text-white">
        <a
          href={T.logo.href}
          target="_blank"
          rel="noreferrer"
          title={T.logo.title}
          className="flex w-fit items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <img src={logo} alt={T.logo.alt} className="h-11 w-11 rounded-full ring-2 ring-white/30" />
          <span className="leading-tight">
            <span className="block text-sm font-semibold">{T.brand.name}</span>
            <span className="block text-xs text-white/80">{T.brand.product}</span>
          </span>
        </a>

        <div className="max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-semibold leading-[1.1] tracking-tight text-balance">
            {T.hero.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/90">
            {T.hero.description}
          </p>
        </div>

        <div>
          <dl className="grid grid-cols-3 border-t border-white/25">
            {T.hero.features.map((f, i) => (
              <div key={f.title} className={`pt-5 pr-5 ${i > 0 ? "pl-5 border-l border-white/25" : ""}`}>
                <dt className="text-sm font-semibold">{f.title}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-white/80">{f.body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-xs text-white/70">
            © {year} {T.footer.copyright}
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col px-6 py-8 sm:px-10">
        {/* Compact brand on small screens */}
        <div className="flex items-center gap-3 lg:hidden">
          <img src={logo} alt={T.logo.alt} className="h-10 w-10 rounded-full ring-1 ring-slate-200" />
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">{T.brand.name}</span>
            <span className="block text-xs text-slate-500">{T.brand.product}</span>
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px]">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{T.heading.title}</h2>
            <p className="mt-1.5 text-sm text-slate-500">{T.heading.subtitle}</p>

            {errorMessage && (
              <div
                role="alert"
                className={`mt-6 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${
                  isInactiveError
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${isInactiveError ? "text-amber-600" : "text-rose-600"}`} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              method="post"
              noValidate
              data-testid="login-form"
              className="mt-7 space-y-5"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  {T.fields.email.label}
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder={T.fields.email.placeholder}
                    value={submitForm.email}
                    onChange={handleChange}
                    autoFocus
                    disabled={isPending}
                    data-testid="email"
                    aria-invalid={hasError("email")}
                    aria-describedby={emailError ? "email-err" : undefined}
                    className={`${inputClass(hasError("email"))} pr-3`}
                  />
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-focus:text-blue-600" />
                </div>
                {emailError && (
                  <p id="email-err" className="mt-1.5 text-xs text-rose-600" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  {T.fields.password.label}
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={isShowPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder={T.fields.password.placeholder}
                    value={submitForm.password}
                    onChange={handleChange}
                    disabled={isPending}
                    data-testid="password"
                    aria-invalid={hasError("password")}
                    aria-describedby={passwordError ? "password-err" : undefined}
                    className={`${inputClass(hasError("password"))} pr-11`}
                  />
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-focus:text-blue-600" />
                  <button
                    type="button"
                    onClick={() => setIsShowPassword((p) => !p)}
                    aria-label={isShowPassword ? T.fields.password.hide : T.fields.password.show}
                    aria-pressed={isShowPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                  >
                    {isShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-err" className="mt-1.5 text-xs text-rose-600" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                data-testid="login-button"
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {T.submit.pending}
                  </>
                ) : (
                  <>
                    {T.submit.idle}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
              {T.footer.notice}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 lg:hidden">
          © {year} {T.footer.copyright}
        </p>
      </main>
    </div>
  );
}
