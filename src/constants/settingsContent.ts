export const SETTINGS_CONTENT = {
  eyebrow: "Account",
  title: "Settings",
  description: "Manage your account and system configuration.",
  tabs: {
    profile: "Profile",
    inventory: "Inventory",
    appearance: "Appearance",
  },
  tabDescriptions: {
    profile: "Your personal and account details",
    inventory: "Item categories and conditions",
    appearance: "Theme and display preferences",
  },
  inventory: {
    title: "Inventory",
    description: "Manage the categories and conditions available when adding or editing items.",
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
  fallbackStatus: "Offline",
  editProfile: "Edit Profile",
  personalInfo: {
    title: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    middleName: "Middle Name",
    phoneNumber: "Phone Number",
  },
  accountInfo: {
    title: "Account Information",
    username: "Username",
    email: "Email",
    role: "Role",
    position: "Position",
  },
  accountStatus: {
    title: "Account Status",
    description: "Your account is active and verified.",
  },
  profileCard: {
    signedInAs: "Signed in as",
  },
  notAvailable: "N/A",
  notProvided: "Not provided",
} as const;
