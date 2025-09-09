export type TRegisterUser = {
  firstName: string,
  lastName: string,
  username: string,
  password: string,
  confirmPassword: string
};

export type TLoginUser = {
  username: string;
  password: string;
};

export type TItemList = {
  id: number;
  datetime: string;
  name: string;
  serial_number: string;
  condition: string;
  stock: string;
  category: string;
  image: File | null;
};

export type TItemForm = {
  image: File | null;
  name: string;
  serial_number: string;
  category: string;
  stock: string;
  condition: string;
  preview: string;
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
