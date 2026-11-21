export const SETTINGS_CONTENT = {
  eyebrow: "Account",
  title: "Settings",
  description: "Manage your account and system configuration.",
  tabs: {
    profile: "Profile",
    businessRules: "Business rules",
    inventory: "Inventory",
    appearance: "Appearance",
  },
  tabDescriptions: {
    profile: "Your personal and account details",
    businessRules: "Loan, kiosk and penalty rules",
    inventory: "Asset categories",
    appearance: "Theme and display preferences",
  },
  businessRules: {
    title: "Business rules",
    description: "System-wide rules from PRD 4.1. Changes apply to new kiosk sessions and loans.",
  },
  inventory: {
    title: "Asset categories",
    description: "Manage the categories available when adding or editing assets, and whether each can be borrowed.",
  },
  profileSection: {
    title: "Profile",
    description: "This information is visible to other administrators.",
  },
  appearance: {
    title: "Theme",
    description: "Choose how the system looks to you. Your choice is saved on this device.",
    options: {
      light: { label: "Light", description: "Bright surfaces, best in well-lit rooms." },
      dark: { label: "Dark", description: "Dimmed surfaces that are easier on the eyes at night." },
      system: { label: "System", description: "Automatically match your device's setting." },
    },
    currentlyShowing: (theme: string) => `Currently showing the ${theme} theme`,
  },
  fallbackName: "User Profile",
  fallbackRole: "User",
  fallbackStatus: "Inactive",
  editProfile: "Edit Profile",
  personalInfo: {
    title: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
  },
  accountInfo: {
    title: "Account Information",
    employeeNo: "Employee No.",
    email: "Email",
    role: "Role",
    eventCoordinator: "Event coordinator",
  },
  accountStatus: {
    title: "Account Status",
    description: "Inactive accounts cannot sign in.",
  },
  profileCard: {
    signedInAs: "Signed in as",
  },
  notAvailable: "N/A",
  notProvided: "Not provided",
} as const;
