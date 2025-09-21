export type TRegisterUser = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export type TStaffFormData = {
  firstName: string;
  lastName: string;
  middleName?: string;
  username: string;
  email: string;
  phoneNumber: string;
  position: string;
  password: string;
  confirmPassword: string;
};

export type TStaffs = {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  position: string;
  status: string;
};

export type TLoginUser = {
  username: string;
  password: string;
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
