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
  Id: string;
  username: string;
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  userRole: string;
  status: string;
};

export type TUpdatedUsers = {
  Id: string;
  username: string;
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
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
  remarks: string;
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
