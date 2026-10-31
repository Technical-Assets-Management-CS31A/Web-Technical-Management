import type { RecordStatus, UserForm, UserRole } from "../../@types/types";
import { validateEmail, validateRequired } from "./validators";

// Values and validation shared by the account create and edit forms (users table, PRD 7.3).

export const USER_ROLES: UserRole[] = ["ADMIN", "TECH_STAFF", "CUSTODIAN", "INSTRUCTOR"];

export type AccountValues = Omit<UserForm, "password" | "confirmPassword"> & { status: RecordStatus };
export type AccountErrors = Partial<Record<keyof UserForm, string>>;

export const validateAccount = (values: AccountValues): AccountErrors => ({
    employeeNo: validateRequired(values.employeeNo, "Employee number"),
    firstName: validateRequired(values.firstName, "First name"),
    lastName: validateRequired(values.lastName, "Last name"),
    email: validateEmail(values.email),
    role: validateRequired(values.role, "Role"),
});
