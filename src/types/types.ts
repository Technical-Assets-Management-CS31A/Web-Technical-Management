export type TRegisterUser = {
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  confirmPassword: string;
};

export type TLoginUser = {
  identifier: string;
  password: string;
};

export type TUserFormData = {
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

export type TUsers = {
  id: string;
  username: string;
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  userRole: string;
  status: string;
};

export type TUpdateUsers = {
  id: string;
  lastName: string;
  middleName: string;
  firstName: string;
  position: string;
};

export type TForgotPasswordUser = {
  username: string;
};

export type TItemForm = {
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

export type TItemList = {
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
  barcode: "",
  barcodeImage: "",
  createdAt: string;
  updatedAt?: string;
};

export type TEditItemForm = {
  Id: number;
  SerialNumber: string;
};

export type TBorrowedItems = {
  id: number;
  datetime: string;
  teacher: string;
  room: string;
  item: string;
  occupied: string;
  status: string;
};

export type TRecentBorrowedItemsTableProps = {
  id: number;
  datetime: string;
  teacher: string;
  room: string;
  item: string;
  occupied: string;
  status: string;
};

export type THistoryBorrwedItems = {
  id: number;
  ItemName: string;
  Borrowed_id: string;
  Teacher: string;
  Room: string;
  Occupied: string;
  Condition: string;
  Event_Date: string;
  Status: string;
};

export type TArchiveItem = {
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
  barcodeImage: string;
  archivedAt: string;
};

export type TBorrowItemForm = {
  itemId: string;
  itemName: string;
  borrowerFirstName: string;
  borrowerLastName: string;
  borrowerRole: string;
  teacherFirstName: string | null;
  teacherLastName: string | null;
  room: string;
  subjectTimeSchedule: string;
  remarks: string | null;
  studentIdNumber: string | null;
};
