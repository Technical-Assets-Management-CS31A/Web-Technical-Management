export const FormatedPhoneNumber = (phone: string) => {
  if (phone.length !== 10) return `+63 ${phone}`;
  return `+63 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
};
