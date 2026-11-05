import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoggedInUser } from "../../hooks/userHooks";
import type { UserDto, UserRole } from "../../@types/types";
import { USER_ROLES } from "../../components/form/accountForm";

type TSignedInUser = Pick<UserDto, "id" | "employeeNo" | "firstName" | "lastName" | "email" | "role" | "status" | "isEventCoordinator">;

const EMPTY_USER: TSignedInUser = {
    id: "",
    employeeNo: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "" as UserRole,
    status: "ACTIVE",
    isEventCoordinator: false,
};

export const UserData = (): TSignedInUser => {
    const { data } = useSuspenseQuery(useLoggedInUser());
    if (!data) console.log("User not found");
    return data ?? EMPTY_USER;
};

// Only users-table accounts sign in to the web; students are roster records with no login.
export const isAccountRole = (role: unknown): role is UserRole => USER_ROLES.includes(role as UserRole);

// Who may manage what on the People, Assets and Rooms screens.
export const canManageAccounts = (role: UserRole | "") => role === "ADMIN";
export const canManageRoster = (role: UserRole | "") => role === "ADMIN" || role === "TECH_STAFF";
export const canManageAssets = (role: UserRole | "") => role === "ADMIN" || role === "TECH_STAFF" || role === "CUSTODIAN";
export const canResolvePenalties = (role: UserRole | "") => role === "ADMIN" || role === "TECH_STAFF";
export const canManageRooms = (role: UserRole | "") => role === "ADMIN" || role === "TECH_STAFF";
