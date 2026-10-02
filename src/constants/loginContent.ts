export const LOGIN_CONTENT = {
  logo: {
    href: "https://www.facebook.com/aclcmandaueph",
    title: "Go to ACLC Page",
    alt: "ACLC Logo",
  },
  hero: {
    titleLines: ["Technical Equipment", "Borrowing System"],
    description:
      "Managing resources, tracking items and borrowers. Ensures smooth lifecycle management.",
    tags: ["Inventory", "Borrow Logs", "User Roles", "Activity Logs"],
  },
  heading: {
    title: "Welcome back!",
    subtitle: "Access the Technical Equipment Borrowing System.",
  },
  fields: {
    identifier: {
      label: "Username",
      placeholder: "Enter your username",
      required: "Username is required",
    },
    password: {
      label: "Password",
      placeholder: "Enter your password",
      required: "Password is required",
      show: "Show password",
      hide: "Hide password",
    },
  },
  submit: {
    idle: "Sign In",
    pending: "Signing in...",
  },
  errors: {
    blocked: "Your account has been blocked.",
    invalid: "Invalid username or password.",
  },
  footer: {
    copyright: "© 2025 ACLC College of Mandaue. All rights reserved.",
    notice: "Official internal tool. Unauthorized access is strictly prohibited.",
  },
} as const;
