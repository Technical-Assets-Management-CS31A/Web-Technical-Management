# Data Models

The web now follows the TAMS PRD data model (TAMS-17, team decisions of 27 to 28 Oct 2026).

- [`src/@types/tams.ts`](src/@types/tams.ts) holds the response DTOs and enums shared with the backend:
  camelCase JSON, UPPER_SNAKE enums, ISO 8601 UTC times shown in Asia/Manila.
- [`src/@types/types.ts`](src/@types/types.ts) re-exports them and adds the web's form and request types
  (`LoginRequest`, `UserForm`, `StudentForm`, `AssetForm`, `ResolveRequest`, ...).
- The API layer calls the PRD section 6 endpoints (`/users`, `/students`, `/assets`, `/loans`, `/kiosk/sessions`, ...).

The old models are kept at the end of this file for reference only; they are no longer in the code.

## Target models

| Old web type(s) | New type | Notes |
|---|---|---|
| `TUsers`, `TTeacher`, `TUserFormData`, `TTeacherFormData`, `EditableUser` | `UserDto` | One users table; `role` is `ADMIN`, `TECH_STAFF`, `CUSTODIAN` or `INSTRUCTOR`. Instructor cards are `AuthCardDto`. |
| `TStudent`, `StudentDetails`, `TUpdateStudent` | `StudentDto`, `SectionDto` | Roster records with no login. Standing is computed by the backend. |
| `TBlockUserData`, `TBlockStatus` | `StudentStandingDto`, `ApprovalFreezeDto` | Warnings, marks, holds, liabilities and freezes replace manual blocking. |
| `TItemList`, `TItemForm` | `AssetDto`, `AssetCategoryDto` | RFID tag UID and QR label; no barcodes. |
| `LentItemData`, `LentItemDetails`, `TRecentBorrowItemProps`, `TBorrowingLogs` | `LoanDto`, `ApprovalDto` | Loans are created only by a kiosk session. |
| `TBorrowSession`, `TReturnSession`, `TStudentRfidSession` | `CheckoutSessionDto` | One DTO with a `type` field. |
| `TActivityLogs` | `LedgerEntryDto`, `AuditLogEntryDto`, `RoomScanDto` | Loan events, admin actions and room taps are split. |
| `TArchiveItem`, `TArchiveStudent`, `TArchiveTeacher` | `deletedAt` on the normal DTOs | Soft delete replaces the archive copies. |
| `TSummary` | `DashboardSummaryDto`, `RoomOccupancyDto`, `StationHealthDto` | Live status board. |
| Five SignalR notification types | `NotificationDto`, `AssetStatusChangedEvent` | Borrow requests now go to the instructor's phone. |
| (none) | `RoomDto`, `StationDto`, `EventDto`, `AnomalyDto`, `AuditDto`, `AuditItemDto`, `SystemSettingDto` | New in the PRD. |

Removed outright: `TRegisterUser`, `TBorrowItemData`, `TGuestBorrowFormData`, every reservation field
(`reservedFor`, `reservedForDate`, `reservedForTime`, the `Reserved` and `Expired` statuses), barcodes,
student accounts, addresses, ID pictures and manual blocking. "Teacher" is "Instructor" everywhere.

Endpoints the web calls that the PRD does not list (team calls): `GET /auth/me`, `POST /auth/change-password`,
`POST /auth/forgot-password`, `PUT/DELETE /users/{id}`, `POST /users/{id}/restore`, `POST /users/{id}/auth-cards`,
`PUT /auth-cards/{id}`, `POST /students/{id}/restore`, `POST /assets/{id}/restore`, `PUT /assets/{id}/status`,
`POST /assets:import`, `/asset-categories`, `GET /dashboard/summary`, `GET /audit-log`,
`GET /kiosk/sessions?active=true`, `POST /kiosk/sessions` (type `ENROLLMENT`), `POST /kiosk/sessions/{id}/cancel`.

### Team calls still open

- Keep `middleName` on users and students?
- Keep `department` on instructors for reports?
- Log in by email only, or also by `employeeNo`?
- Add forgot-password and change-password endpoints?
- Keep an asset photo (new `ASSET_IMAGE` media kind)?
- Link RFID tags and instructor cards by a kiosk tap session (e.g. `TAG_ASSIGN`) or by typing the UID?
- Allow restoring soft-deleted records?
- Add one `GET /dashboard/summary` endpoint?
- Keep `category` on activity logs as `entityType`, and the categories count on the dashboard?
- Add a list endpoint for `audit_log`.

## Legacy models (removed, for reference)

### Auth

```ts
type TRegisterUser = {
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  confirmPassword: string;
};

type TLoginUser = {
  identifier: string;
  password: string;
};

type TForgotPasswordUser = {
  username: string;
};

type TUpdatePassword = {
  newPassword: string;
  confirmPassword: string;
};
```

### Users

```ts
type TUsers = {
  id: string;
  username: string;
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  course: string;
  section: string;
  year: string;
  userRole: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  position: string;
  isBlocked?: boolean;
  blockReason?: string | null;
  blockedAt?: string | null;
  blockedUntil?: string | null;
};

type TUserFormData = {
  username: string;
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  confirmPassword: string;
};

type TUpdateUsers = {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  lastName: string;
  middleName: string;
  firstName: string;
  position: string;
};

type EditableUser = {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  username?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  position?: string | null;
};
```

### Teachers

```ts
type TTeacher = {
  id: string;
  username: string;
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  department: string;
  subject: string;
  userRole: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  isBlocked?: boolean;
  blockReason?: string | null;
  blockedAt?: string | null;
  blockedUntil?: string | null;
};

type TTeacherFormData = {
  username: string;
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  department?: string;
  subject?: string;
};

type TUpdatedTeacher = {
  lastName: string;
  middleName: string;
  firstName: string;
  department: string;
};
```

### Students

```ts
type TStudent = {
  frontStudentIdPicture: null;
  backStudentIdPicture: null;
  studentIdNumber: string;
  phoneNumber: string;
  course: string;
  section: string;
  year: string;
  profilePicture: null;
  street: string;
  cityMunicipality: string;
  province: string;
  postalCode: string;
  id: string;
  username: string;
  email: string;
  userRole: string;
  status: string;
  lastName: string;
  middleName: string;
  firstName: string;
  generatedPassword?: string;
  isBlocked?: boolean;
  blockReason?: string | null;
  blockedAt?: string | null;
  blockedUntil?: string | null;
  rfidUid?: string | null;
};

type TStudentFormData = {
  FirstName: string;
  MiddleName: string;
  LastName: string;
  StudentIdNumber: string;
  Course: string;
  Section: string;
  Year: string;
  Street: string;
  Province: string;
  PostalCode: string;
  CityMunicipality: string;
  ProfilePicture?: string;
};

type TUpdateStudent = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  studentIdNumber: string;
  phoneNumber: string;
  course: string;
  section: string;
  year: string;
  street: string;
  cityMunicipality: string;
  province: string;
  postalCode: string;
  username: string;
  email: string;
  userRole: string;
  status: string;
  frontStudentIdPicture: File | string | null;
  backStudentIdPicture: File | string | null;
  profilePicture: File | string | null;
  rfidUid?: string | null;
};

type StudentDetails = {
  Id: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  StudentIdNumber: string;
  Course: string;
  Section: string;
  Year: string;
  Street: string;
  Province: string;
  PostalCode: string;
  CityMunicipality: string;
  Email: string;
  PhoneNumber: string;
  FrontIdPicture?: string;
  BackIdPicture?: string;
  GeneratedPassword?: string;
};
```

### User Blocking

```ts
type TBlockUserData = {
  reason: string;
  isPermanent: boolean;
  blockedUntil?: string;
};

type TBlockStatus = {
  isBlocked: boolean;
  blockReason: string | null;
  blockedAt: string | null;
  blockedUntil: string | null;
  isPermanent: boolean;
  blockedById: string | null;
  blockedByUsername: string | null;
};
```

### Items

```ts
type TItemList = {
  id: string,
  serialNumber: string,
  rfidUid: string,
  image: null,
  itemName: string,
  itemType: string,
  itemModel: string | null,
  itemMake: string,
  description: string | null,
  category: string,
  condition: string,
  status: string,
  createdAt: string,
  updatedAt: string
};

type TItemForm = {
  serialNumber: string;
  image: File | null;
  itemName: string;
  itemType: string;
  itemModel: string;
  itemMake: string;
  description: string;
  category: string;
  condition: string;
  preview: string | null;
};

```

### Borrowing (Lent Items)

```ts
type LentItemsStatus =
  | "Pending"
  | "Reserved"
  | "Approved"
  | "Denied"
  | "Canceled"
  | "Borrowed"
  | "Returned"
  | "Expired";

type TBorrowItemData = {
  tagUid: string;
  borrowerFirstName: string;
  borrowerLastName: string;
  organization: string | null;
  contactNumber: string | null;
  purpose: string | null;
  supervisorName: string | null;
  room: string;
  subjectTimeSchedule: string;
  reservedFor: string | null;
  remarks: string | null;
  status: "Borrowed" | "Reserved" | null;
  guestImage: string | null;
};

type TGuestBorrowFormData = {
  tagUid: string;
  borrowerFirstName: string;
  borrowerLastName: string;
  organization: string | null;
  contactNumber: string | null;
  purpose: string | null;
  supervisorName: string | null;
  room: string;
  subjectTimeSchedule: string;
  remarks: string | null;
  reservedFor: string | null;
  reservedForDate: string | null;
  reservedForTime: string | null;
  status: "Borrowed" | "Reserved" | "Pending" | null;
  guestImage: File | null;
  guestImagePreview: string | null;
};

type TRecentBorrowItemProps = {
  id: string;
  userId: null;
  teacherId: string;
  borrowerFullName: string;
  borrowerRole: string;
  teacherFullName: string;
  room: string;
  subjectTimeSchedule: string;
  lentAt: string;
  returnedAt: string;
  status: string;
  remarks: null;
  isHiddenFromUser: boolean;
  barcode?: string | null;
  barcodeImage?: string | null;
  reservedFor?: string | null;
  guestImage?: string | null;
  frontStudentIdPicture?: string | null;
  studentIdNumber?: string | null;
  item: {
    id: string;
    serialNumber: string;
    barcode: null;
    barcodeImage: null;
    image: null;
    itemName: string;
    itemType: string;
    itemModel: string;
    itemMake: string;
    description: string;
    category: string;
    condition: string;
    createdAt: string;
    updatedAt: string;
  };
};

type LentItemData = TRecentBorrowItemProps & {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phoneNumber: string;
    userRole: string;
    frontStudentIdPicture?: string | null;
    backStudentIdPicture?: string | null;
    studentIdNumber?: string;
    course?: string;
    section?: string;
    year?: string;
  };
};

type LentItemDetails = {
  id: string;
  itemId: string;
  itemName: string;
  userId: string;
  borrowerFullName: string;
  borrowerRole: string;
  studentIdNumber?: string;
  room: string;
  subjectTimeSchedule: string;
  lentAt: string;
  returnedAt?: string;
  status: string;
  barcode: string;
  isHiddenFromUser: boolean;
  remarks?: string;
};
```

### Archive

```ts
type TArchiveItem = {
  id: string;
  serialNumber: string;
  image: string;
  itemName: string;
  itemType: string;
  itemModel: string;
  itemMake: string;
  description: string;
  category: string;
  condition: string;
  createdAt: string;
  updatedAt: string;
};

type TArchiveStudent = {
  $type: string;
  archivedAt: string;
  backStudentIdPicture: string;
  cityMunicipality: string;
  course: string;
  email: string;
  firstName: string;
  frontStudentIdPicture: string;
  id: string;
  lastName: string;
  middleName: string;
  originalUserId: string;
  phoneNumber: string;
  postalCode: string;
  profilePicture: string;
  province: string;
  section: string;
  status: string;
  studentIdNumber: string;
  userRole: string;
  username: string;
  year: string;
  street: string;
};

type TArchiveTeacher = {
  $type: string;
  archivedAt: string;
  department: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  middleName: string | null;
  originalUserId: string;
  phoneNumber: string;
  status: string;
  userRole: string;
  username: string;
};
```

### Logs

```ts
type TActivityLogs = {
  action: string;
  actorName: string;
  actorRole: string;
  actorUserId: string;
  borrowedAt: string | null;
  category: string;
  createdAt: string;
  id: string;
  itemId: string;
  itemName: string;
  itemSerialNumber: string;
  lentItemId: string;
  newStatus: string;
  previousStatus: string;
  remarks: string | null;
  reservedFor: string;
  returnedAt: string | null;
}

type TBorrowingLogs = {
  id: string;
  borrowerUserId: string | null;
  borrowerName: string | null;
  borrowerRole: string;
  studentIdNumber: string | null;
  frontStudentIdPictureUrl: string | null;
  frontStudentIdPicture?: string | null;
  guestImageUrl: string | null;
  guestImage?: string | null;
  itemId: string;
  itemName: string;
  itemSerialNumber: string;
  previousStatus: string;
  currentStatus: string;
  borrowedAt: string;
  returnedAt: string;
  reservedFor: string | null;
  remarks: string;
  createdAt: string;
}
```

### Dashboard

```ts
type TSummary = {
  totalItems: number | null;
  totalActiveUsers: number | null;
  totalLentItems: number | null;
  totalItemsCategories: number | null;
}
```

### RFID Sessions

```ts
type TRfidSession = {
  id: string;
  itemId: string;
  itemName: string;
  serialNumber: string;
  status: "Pending" | "Completed" | "Expired";
  expiresAt: string;
  createdAt: string;
};

type TStudentRfidSession = {
  id: string;
  studentId: string;
  studentName: string;
  status: "Pending" | "Completed" | "Failed" | "Cancelled" | "Expired";
  expiresAt: string;
  createdAt: string;
  scannedRfidUid?: string | null;
  errorMessage?: string | null;
};

type TBorrowSession = {
  id: string;
  status: "Pending" | "Completed" | "Failed" | "Cancelled";
  studentName: string | null;
  itemName: string | null;
  lentItemId: string | null;
  errorMessage: string | null;
  createdAt: string;
  expiresAt: string;
};

type TReturnSession = {
  id: string;
  status: "Pending" | "Completed" | "Failed" | "Cancelled";
  itemName: string | null;
  borrowerName: string | null;
  lentItemId: string | null;
  errorMessage: string | null;
  createdAt: string;
  expiresAt: string;
};

type TItemScanSession = {
  id: string;
  status: "Pending" | "Completed" | "Failed" | "Cancelled";
  itemId: string | null;
  itemName: string | null;
  rfidUid: string | null;
  errorMessage: string | null;
  createdAt: string;
  expiresAt: string;
};
```

### Notifications

```ts
type NewPendingRequestNotification = {
  type: "new_pending_request";
  lentItemId: string;
  itemName: string;
  borrowerName: string;
  reservedFor?: string;
  message: string;
  timestamp: string;
};

type ApprovalNotification = {
  type: "approval";
  lentItemId: string;
  itemName: string;
  borrowerName: string;
  message: string;
  timestamp: string;
};

type StatusChangeNotification = {
  type: "status_change";
  lentItemId: string;
  itemName: string;
  oldStatus: string;
  newStatus: string;
  message: string;
  timestamp: string;
};

type ReservationExpiredNotification = {
  type: "reservation_expired";
  lentItemId: string;
  itemName: string;
  borrowerName: string;
  reservedFor: string;
  message: string;
  timestamp: string;
};

type ReservationDueSoonSignalRNotification = {
  type: "reservation_due_soon";
  lentItemId: string;
  itemName: string;
  borrowerName: string;
  borrowerRole?: string;
  guestImageUrl?: string | null;
  frontStudentIdPictureUrl?: string | null;
  reservedFor: string;
  message: string;
  timestamp: string;
};

```