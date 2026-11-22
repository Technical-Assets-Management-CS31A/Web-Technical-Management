export const LOGIN_CONTENT = {
  logo: {
    href: "https://www.facebook.com/aclcmandaueph",
    title: "Go to ACLC Page",
    alt: "ACLC Logo",
  },
  brand: {
    name: "ACLC College of Mandaue",
  },
  hero: {
    product: "Technical Assets Management System",
    description:
      "Track equipment from the shelf to the classroom and back, with RFID check-out, live loan status and a full audit trail.",
    features: [
      { title: "Assets", body: "Tagged by RFID and QR, with full history." },
      { title: "Loans", body: "Who has what, where, and when it's due." },
      { title: "Accountability", body: "Penalties, liabilities and activity logs." },
    ],
  },
  heading: {
    title: "Sign in",
    subtitle: "Use your staff or instructor account.",
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
    idle: "Sign in",
    pending: "Signing in…",
  },
  errors: {
    inactive: "Your account is inactive. Contact an administrator.",
    invalid: "Invalid email or password.",
    staffOnly: "This sign-in is for staff and instructor accounts. Students borrow at the kiosk with their RFID card.",
  },
  footer: {
    copyright: "ACLC College of Mandaue. All rights reserved.",
    notice: "Authorized personnel only. Activity on this system is logged.",
  },
} as const;
