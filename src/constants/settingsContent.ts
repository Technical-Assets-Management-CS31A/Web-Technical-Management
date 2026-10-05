export const SETTINGS_CONTENT = {
  title: "Settings",
  description: "Manage your account and system configuration.",
  tabs: {
    profile: "Profile",
    inventory: "Inventory",
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
  notAvailable: "N/A",
  notProvided: "Not provided",
} as const;
