// Web form and request types. Response DTOs and enums live in ./tams.ts
// (PRD 7.2, 7.3 and 7.6) and are re-exported here so screens import from one place.
import type {
  AssetCondition,
  AssetStatus,
  AssetType,
  CardStatus,
  RecordStatus,
  StationType,
  StudentStanding,
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

// ── Lists ────────────────────────────────────────────────────────────────────

// PRD 6.3: every list endpoint supports page, pageSize, sort and q.
export type ListParams = {
  page: number;
  pageSize: number;
  /** Field name, prefixed with "-" for descending, e.g. "-createdAt" */
  sort?: string;
  q?: string;
};

export type Paged<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AssetListParams = ListParams & {
  /** Several statuses are sent comma-separated */
  status?: AssetStatus | AssetStatus[];
  condition?: AssetCondition;
  type?: AssetType;
  categoryId?: string;
  includeDeleted?: boolean;
};

export type UserListParams = ListParams & {
  role?: UserRole;
  status?: RecordStatus;
  includeDeleted?: boolean;
};

export type StudentListParams = ListParams & {
  sectionId?: string;
  standing?: StudentStanding;
  /** true = at least one finger enrolled, false = none yet */
  enrolled?: boolean;
  includeDeleted?: boolean;
};

// ── Roster import (POST /students:import, FR-9.3) ────────────────────────────

/** One CSV row as the web reads it before upload. */
export type RosterRow = {
  /** 1-based line in the file, header is line 1 */
  line: number;
  studentNo: string;
  firstName: string;
  lastName: string;
  sectionCode: string;
  schoolYear: string;
};

export type RosterImportIssue = { line: number | null; studentNo?: string | null; message: string };

/** The backend's import report; fields are optional until the import endpoint is pinned down. */
export type RosterImportResult = {
  created: number | null;
  updated: number | null;
  skipped: number | null;
  sectionsCreated: number | null;
  errors: RosterImportIssue[];
};

// Staff set only MAINTENANCE and RETIRED; IN_STORAGE brings an asset back.
export type StaffAssetStatus = Extract<AssetStatus, "MAINTENANCE" | "RETIRED" | "IN_STORAGE">;

export type AssetCategoryForm = {
  name: string;
  description: string;
  isBorrowable: boolean;
};

// ── Rooms and stations ───────────────────────────────────────────────────────

export type RoomForm = {
  code: string;
  name: string;
  building: string;
  floor: string;
  isStorage: boolean;
  status: RecordStatus;
};

// Health, heartbeat and firmware are reported by the station itself.
export type StationForm = {
  stationCode: string;
  type: StationType;
  roomId: string;
  ipAddress: string;
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
