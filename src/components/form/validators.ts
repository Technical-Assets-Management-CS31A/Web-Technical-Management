// Small field validators shared by the edit forms. Each returns an error message or undefined.

export const validateRequired = (value: string | null | undefined, label: string) =>
  value?.trim() ? undefined : `${label} is required`;

export const validateEmail = (value: string | null | undefined) => {
  if (!value?.trim()) return "Email is required";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "Enter a valid email address";
};

/** Philippine mobile number: 9XXXXXXXXX, optionally prefixed with 0 or 63 */
export const validatePhone = (value: string | null | undefined, required: boolean) => {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return required ? "Phone number is required" : undefined;
  return /^(?:63|0)?9\d{9}$/.test(digits) ? undefined : "Enter a valid mobile number (e.g. 9171234567)";
};
