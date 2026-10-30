// Web form and request types. Response DTOs and enums live in ./tams.ts
// (PRD 7.2, 7.3 and 7.6) and are re-exported here so screens import from one place.
import type {
  AssetCondition,
  AssetStatus,
  AssetType,
  CardStatus,
  RecordStatus,
  UserRole,
} from "./tams";

export type * from "./tams";

// ── Auth ─────────────────────────────────────────────────────────────────────

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  role: UserRole;
};

// Team call: not in PRD 6.3; keyed on email since username is gone.
export type ForgotPasswordRequest = {
  email: string;
};

// Team call: backend adds e.g. POST /auth/change-password.
export type ChangePasswordRequest = {
  newPassword: string;
  confirmPassword: string;
};

// ── People ───────────────────────────────────────────────────────────────────

export type UserForm = {
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEventCoordinator: boolean;
  defaultRoomId: string | null;
  password: string;
  confirmPassword: string;            // client-side only
};

export type CreateUserRequest = Omit<UserForm, "confirmPassword">;

export type UpdateUserRequest = Omit<UserForm, "password" | "confirmPassword"> & {
  status: RecordStatus;
};

export type AuthCardRequest = {
  cardUid: string;
  status: CardStatus;
};

export type StudentForm = {
  studentNo: string;
  firstName: string;
  lastName: string;
  sectionId: string;
  status: RecordStatus;
};

export type SectionForm = {
  code: string;
  program: string;
  yearLevel: number;
  schoolYear: string;
  adviserUserId: string | null;
};

// Every clear, lift, settle or resolve action carries a reason.
export type ResolveRequest = {
  reason: string;
};

export type SettleLiabilityRequest = {
  status: "SETTLED_PAYMENT" | "SETTLED_REPLACEMENT" | "WAIVED";
  receiptNo: string | null;
  reason: string;
};

// ── Assets ───────────────────────────────────────────────────────────────────

export type AssetForm = {
  assetCode: string;
  name: string;
  categoryId: string;
  type: AssetType;
  brand: string;
  model: string;
  serialNo: string;
  rfidTagUid: string;
  homeRoomId: string;
  condition: AssetCondition;
  replacementCost: number;
  acquiredAt: string;
  notes: string;
};

// Staff set only MAINTENANCE and RETIRED; IN_STORAGE brings an asset back.
export type StaffAssetStatus = Extract<AssetStatus, "MAINTENANCE" | "RETIRED" | "IN_STORAGE">;

export type AssetCategoryForm = {
  name: string;
  description: string;
  isBorrowable: boolean;
};

// ── Loans ────────────────────────────────────────────────────────────────────

export type ChangeLoanRoomRequest = {
  destinationRoomId: string;
  reason: string;
};

export type LoanFilters = {
  status?: string;
  roomId?: string;
  approvedBy?: "me";
};
