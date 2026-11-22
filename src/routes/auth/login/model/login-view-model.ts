import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import type { LoginRequest, LoginResponse } from "../../../../@types/types";
import { useLogin } from "../../../../hooks/authHooks";
import { logoutUserApi } from "../../../../api/auth_api";
import { LOGIN_CONTENT as T } from "../../../../constants/loginContent";
import { setRefreshToken, setToken } from "../../../../utils/token";
import { getErrorMessage } from "../../../../components/form/FormKit";
import { isAccountRole } from "../../../../utils/usersData/userData";
import { resolveLoginRole } from "../../../../lib/loginRole";

export type LoginField = keyof LoginRequest;

export const useLoginViewModel = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isInactiveError, setIsInactiveError] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<LoginField, string>>({ email: "", password: "" });
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });

  const { mutate, isPending } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
    setIsInactiveError(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = {
      email: form.email ? "" : T.fields.email.required,
      password: form.password ? "" : T.fields.password.required,
    };
    setFieldErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    mutate(form, {
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
        // back out, which also revokes the refresh token so the route guard can't revive it.
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

  return {
    form,
    fieldErrors,
    errorMessage,
    isInactiveError,
    isPending,
    isShowPassword,
    toggleShowPassword: () => setIsShowPassword((p) => !p),
    /** A field is marked invalid for its own error or a failed sign-in. */
    hasError: (field: LoginField) => !!fieldErrors[field] || !!errorMessage,
    handleChange,
    handleSubmit,
    year: new Date().getFullYear(),
  };
};

export type LoginViewModel = ReturnType<typeof useLoginViewModel>;
