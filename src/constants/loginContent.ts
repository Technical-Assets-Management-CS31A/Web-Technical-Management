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
    tags: ["Assets", "Loans", "People", "Activity"],
  },
  heading: {
    title: "Welcome back!",
    subtitle: "Access the Technical Equipment Borrowing System.",
  },
  fields: {
    email: {
      label: "Email",
      placeholder: "you@aclc.edu.ph",
      required: "Email is required",
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
    inactive: "Your account is inactive. Contact an administrator.",
    invalid: "Invalid email or password.",
    staffOnly: "This sign-in is for staff and instructor accounts. Students borrow at the kiosk with their RFID card.",
  },
  footer: {
    copyright: "© 2025 ACLC College of Mandaue. All rights reserved.",
    notice: "Official internal tool. Unauthorized access is strictly prohibited.",
  },
} as const;
