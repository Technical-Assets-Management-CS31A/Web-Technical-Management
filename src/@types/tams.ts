// TAMS data contract (PRD sections 7.2, 7.3 and 7.6), shared with the backend.
// JSON is camelCase, enums are UPPER_SNAKE, times are ISO 8601 UTC.
// These types replace the old models in ./types.ts screen by screen.

// ── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "TECH_STAFF" | "CUSTODIAN" | "INSTRUCTOR";
export type RecordStatus = "ACTIVE" | "INACTIVE";
export type CardStatus = "ACTIVE" | "LOST" | "REVOKED";
export type StudentStanding = "GOOD" | "WARNED" | "BLOCKED";
export type AssetType = "BORROWABLE" | "FIXED";
export type AssetStatus =
  | "IN_STORAGE" | "AT_COUNTER" | "IN_TRANSIT" | "IN_ROOM_VERIFIED"
  | "LOCATION_ANOMALY" | "OVERDUE" | "MISSING" | "MAINTENANCE" | "RETIRED";
export type AssetCondition = "GOOD" | "FAIR" | "DAMAGED";
export type LoanType = "STANDARD" | "EVENT";
export type LoanStatus = "ACTIVE" | "OVERDUE" | "RETURNED" | "MISSING";
export type CustodyState = "AWAITING_ARRIVAL" | "VERIFIED" | "ANOMALY" | "NOT_REQUIRED";
export type ClassLengthMinutes = 90 | 120 | 150 | 180;
export type SessionType = "CHECKOUT" | "RETURN" | "EVENT_BATCH" | "EVENT_RETURN" | "ENROLLMENT";
export type SessionStatus =
  | "AWAITING_FINGERPRINT" | "AWAITING_ASSET" | "AWAITING_PHOTO" | "AWAITING_APPROVAL"
  | "AWAITING_CONFIRM" | "COMPLETED" | "DECLINED" | "CANCELLED" | "EXPIRED" | "FAILED";
export type ApprovalDecision = "PENDING" | "APPROVED" | "DECLINED" | "EXPIRED";
export type PenaltyStatus = "ACTIVE" | "CLEARED";
export type PenaltyReason = "LATE_ARRIVAL_LIMIT" | "OVERDUE" | "MISSING";
export type LiabilityStatus = "OUTSTANDING" | "SETTLED_PAYMENT" | "SETTLED_REPLACEMENT" | "WAIVED";
export type StationType = "COUNTER_KIOSK" | "ROOM_STATION";
export type StationHealth = "ONLINE" | "WARNING" | "OFFLINE";
export type AnomalyType = "TRANSIT_TIMEOUT" | "WRONG_ROOM" | "UNBORROWED_TAP";
export type AnomalyStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
export type EventStatus = "SCHEDULED" | "ACTIVE" | "CLOSED" | "CANCELLED";
export type RoomScanResult = "VERIFIED" | "VERIFIED_LATE" | "WRONG_ROOM" | "NOT_BORROWED" | "UNKNOWN_TAG";
export type LedgerEvent =
  | "CHECKOUT" | "ROOM_VERIFIED" | "LATE_ARRIVAL_WARNING" | "RETURN"
  | "OVERDUE" | "MARKED_MISSING" | "SETTLED";
export type AuditResult = "MATCHED" | "MISSING" | "MISPLACED" | "UNKNOWN";

// Stable kiosk failure codes; map to text in the UI.
export type SessionFailureCode = "STUDENT_BLOCKED" | "PHOTO_FAILED" | "INSTRUCTOR_FROZEN" | (string & {});

// ── Shared references ────────────────────────────────────────────────────────

type Ref = { id: string; fullName: string };
type RoomRef = { id: string; code: string; name: string };
type AssetRef = { id: string; assetCode: string; name: string };

// ── People ───────────────────────────────────────────────────────────────────

export interface AuthCardDto {
  id: string;
  cardUid: string;
  userId?: string;
  status: CardStatus;
  issuedAt: string;
}

export interface UserDto {                  // replaces TUsers + TTeacher
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isEventCoordinator: boolean;
  defaultRoomId: string | null;             // instructors
  status: RecordStatus;
  isFrozen?: boolean;                       // derived from approval_freezes
  activeFreeze?: ApprovalFreezeDto | null;  // the freeze to lift, when isFrozen
  authCards?: AuthCardDto[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SectionDto {
  id: string;
  code: string;                             // BSCS-2A
  program: string;
  yearLevel: number;
  schoolYear: string;                       // 2026-2027
  adviserUserId?: string | null;
}

export interface StudentDto {               // replaces TStudent, StudentDetails
  id: string;
  studentNo: string;
  firstName: string;
  lastName: string;
  section: SectionDto;
  standing: StudentStanding;
  activeWarningCount: number;
  activeMarkCount: number;
  hasActiveHold: boolean;
  enrolledFingerCount: number;              // templates are never sent to the web
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ── Penalties ────────────────────────────────────────────────────────────────

export interface LateArrivalWarningDto {
  id: string;
  loanId: string;
  anomalyId?: string | null;
  warningNo: number;                        // 1, 2, 3, 4+
  schoolTerm: string;
  triggeredPenalty: boolean;
  status: PenaltyStatus;
  issuedAt: string;
}

export interface NonComplianceMarkDto {
  id: string;
  loanId: string;
  reason: PenaltyReason;
  status: PenaltyStatus;
  issuedAt: string;
}

export interface ProfileHoldDto {
  id: string;
  loanId: string;
  status: PenaltyStatus;
  placedAt: string;
}

export interface LiabilityDto {
  id: string;
  loanId: string;
  amount: number;                           // PHP, from asset replacementCost
  status: LiabilityStatus;
  receiptNo: string | null;
}

export interface ApprovalFreezeDto {
  id: string;
  instructorId: string;
  loanId?: string | null;
  reason?: string | null;
  status: PenaltyStatus;
  frozenAt: string;
}

export interface StudentStandingDto {       // replaces TBlockStatus
  studentId: string;
  standing: StudentStanding;
  warnings: LateArrivalWarningDto[];
  marks: NonComplianceMarkDto[];
  holds: ProfileHoldDto[];
  liabilities: LiabilityDto[];
}

// ── Places and devices ───────────────────────────────────────────────────────

export interface RoomDto {
  id: string;
  code: string;                             // CL10
  name: string;
  building: string;
  floor: string;
  isStorage: boolean;
  status: RecordStatus;
  deletedAt: string | null;
}

export interface StationDto {
  id: string;
  stationCode: string;                      // KIOSK-01, RS-CL10
  type: StationType;
  roomId: string;
  health: StationHealth;
  lastHeartbeatAt: string | null;
  firmwareVersion: string | null;
  ipAddress: string | null;
  deletedAt: string | null;
}

// ── Assets ───────────────────────────────────────────────────────────────────

export interface AssetCategoryDto {
  id: string;
  name: string;
  description: string | null;
  isBorrowable: boolean;
}

export interface AssetDto {                 // replaces TItemList
  id: string;
  assetCode: string;                        // LP-014
  name: string;
  category: { id: string; name: string; isBorrowable: boolean };
  type: AssetType;
  brand: string | null;
  model: string | null;
  serialNo: string | null;
  rfidTagUid: string | null;                // uppercase hex, required for BORROWABLE
  homeRoomId: string;
  currentRoomId: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  replacementCost: number;                  // PHP
  acquiredAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ── Loans ────────────────────────────────────────────────────────────────────

export interface ApprovalDto {
  id: string;
  instructor: Ref;
  decision: ApprovalDecision;
  destinationRoomId: string | null;
  classLengthMinutes: ClassLengthMinutes | null;
  requestedAt: string;
  decidedAt: string | null;
  decidedDevice: string | null;
}

export interface LoanDto {                  // PRD 7.6, replaces all lent-item types
  id: string;
  loanNo: string;                           // L-2026-000123
  type: LoanType;
  status: LoanStatus;
  custodyState: CustodyState;
  asset: AssetRef & { status: AssetStatus };
  student: { id: string; studentNo: string; fullName: string; sectionCode: string } | null;
  approvedBy: Ref | null;                   // instructor
  destinationRoom: RoomRef | null;
  checkedOutAt: string;
  transitDeadlineAt: string | null;
  verifiedAt: string | null;
  classLengthMinutes: ClassLengthMinutes | null;
  classEndsAt: string;
  graceMinutes: number;
  dueAt: string;
  returnedAt: string | null;
  photoUrl: string | null;                  // counter webcam photo
  lateArrivalWarningNo: number | null;
  notes?: string | null;
  event?: { id: string; title: string } | null;
  coordinator?: Ref | null;
  approvals?: ApprovalDto[];
}

// ── Kiosk sessions ───────────────────────────────────────────────────────────

export interface CheckoutSessionDto {       // replaces TBorrowSession, TReturnSession, TStudentRfidSession
  id: string;
  type: SessionType;
  status: SessionStatus;
  station: { id: string; stationCode: string };
  instructor: Ref | null;
  student: Ref | null;
  asset: AssetRef | null;
  photoUrl: string | null;
  destinationRoom: RoomRef | null;
  classLengthMinutes: number | null;
  fingerprintAttempts: number;              // max 3
  lcdLines: [string, string, string, string];
  failureCode: SessionFailureCode | null;
  loanId: string | null;
  eventId: string | null;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
}

// ── Events, anomalies, audits ────────────────────────────────────────────────

export interface EventDto {
  id: string;
  title: string;
  venueText: string | null;
  venueRoomId: string | null;
  startsAt: string;
  endsAt: string;
  coordinatorUserId: string;
  status: EventStatus;
}

export interface AnomalyDto {
  id: string;
  type: AnomalyType;
  status: AnomalyStatus;
  asset: AssetRef;
  loan: { id: string; loanNo: string } | null;
  room: RoomRef | null;
  station: { id: string; stationCode: string } | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface AuditItemDto {
  id: string;
  auditId: string;
  asset: AssetRef | null;
  result: AuditResult;
}

export interface AuditDto {
  id: string;
  roomId: string;
  matchedCount: number;
  missingCount: number;
  misplacedCount: number;
  unknownCount: number;
  createdAt: string;
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export interface LedgerEntryDto {           // append-only transaction_ledger row
  id: string;
  event: LedgerEvent;
  loanId: string;
  asset: AssetRef;
  student: Ref | null;
  instructor: Ref | null;
  actor: (Ref & { role: UserRole }) | null;
  actorStation: { id: string; stationCode: string } | null;
  photoUrl: string | null;
  approvalDecidedAt: string | null;
  details: Record<string, unknown> | null;
  occurredAt: string;
}

export interface AuditLogEntryDto {         // admin actions
  id: string;
  actor: Ref & { role: UserRole };
  action: string;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface RoomScanDto {
  id: string;
  stationId: string;
  tagUid: string;
  result: RoomScanResult;
  scannedAt: string;
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface RoomOccupancyDto {
  roomId: string;
  verifiedCount: number;
  incoming: { loanId: string; asset: AssetRef; transitDeadlineAt: string }[];
}

export interface StationHealthDto {
  stationId: string;
  stationCode: string;
  health: StationHealth;
  lastHeartbeatAt: string | null;
  firmwareVersion: string | null;
}

export interface DashboardSummaryDto {      // replaces TSummary
  totalAssets: number;
  atCounter: number;
  inTransit: number;
  inRoomVerified: number;
  locationAnomaly: number;
  overdue: number;
  openAnomalies: number;
}

// ── Settings and notifications ───────────────────────────────────────────────

export interface SystemSettingDto {         // business rules from PRD 4.1
  key: string;                              // e.g. transit window, grace minutes, warning limit
  value: string;
}

export interface NotificationDto {          // replaces the five notification types
  id: string;
  recipientUserId: string;                  // always staff or instructor
  type: string;                             // "LATE_ARRIVAL_WARNING", "LOAN_OVERDUE", ...
  title: string;
  body: string;
  payload: Record<string, unknown>;
  loanId: string | null;
  studentId: string | null;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

// SignalR events for staff dashboards (PRD 6.4).
export interface AssetStatusChangedEvent {
  assetId: string;
  oldStatus: AssetStatus;
  newStatus: AssetStatus;
  roomId: string | null;
}
