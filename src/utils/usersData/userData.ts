import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoggedInUser } from "../../hooks/userHooks";
import type { UserDto, UserRole } from "../../@types/types";

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

// Who may manage what on the People and Assets screens.
export const canManageAccounts = (role: UserRole | "") => role === "ADMIN";
export const canManageRoster = (role: UserRole | "") => role === "ADMIN" || role === "TECH_STAFF";
export const canManageAssets = (role: UserRole | "") => role === "ADMIN" || role === "TECH_STAFF" || role === "CUSTODIAN";
export const canResolvePenalties = (role: UserRole | "") => role === "ADMIN" || role === "TECH_STAFF";
