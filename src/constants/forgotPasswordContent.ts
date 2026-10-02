export const FORGOT_PASSWORD_CONTENT = {
  title: "Forgot Password",
  description:
    "Enter your username and we'll send you instructions to reset your password.",
  placeholder: "Enter your username",
  submit: "Send Reset Instructions",
  rememberPassword: "Remember your password?",
  backToLogin: "Back to Login",
  success: "Password reset instructions have been sent to your email.",
  errors: {
    required: "Email is required",
    notFound: "Email not found in our system",
    generic: "Something went wrong. Please try again.",
    network: "Network error. Please check your connection and try again.",
  },
} as const;
