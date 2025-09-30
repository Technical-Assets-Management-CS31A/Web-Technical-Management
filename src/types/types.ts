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
  ItemName: string;
  SerialNumber: string;
  Image: File | null;
  ItemType: string;
  ItemModel: string;
  ItemMake: string;
  Description: string;
  Category: string;
  Condition: string;
  preview: string | null;
};

export type TItemList = {
  id: number;
  datetime: string;
  ItemName: string;
  SerialNumber: string;
  Image: File | null;
  ItemType: string;
  ItemModel: string;
  ItemMake: string;
  Description: string;
  Category: string;
  Condition: string;
  image: string | null;
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
