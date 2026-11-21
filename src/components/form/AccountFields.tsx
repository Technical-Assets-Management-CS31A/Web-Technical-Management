import { useQuery } from "@tanstack/react-query";
import { useAllRooms } from "../../hooks/assetHooks";
import { formatRole } from "../../lib/utils";
import type { RecordStatus, UserRole } from "../../@types/types";
import { Field, FormSection, SelectInput, TextInput } from "./FormKit";
import { USER_ROLES, type AccountErrors, type AccountValues } from "./accountForm";

// Shared fields for the account create and edit forms (users table, PRD 7.3).

type AccountFieldsProps = {
    values: AccountValues;
    errors: AccountErrors;
    onChange: <K extends keyof AccountValues>(key: K, value: AccountValues[K]) => void;
    showStatus?: boolean;
};

export function AccountFields({ values, errors, onChange, showStatus = false }: AccountFieldsProps) {
    const { data: rooms = [] } = useQuery(useAllRooms());
    const isInstructor = values.role === "INSTRUCTOR";

    return (
        <>
            <FormSection title="Person">
                <Field label="First name" htmlFor="account-firstName" required error={errors.firstName}>
                    <TextInput id="account-firstName" value={values.firstName} onChange={(e) => onChange("firstName", e.target.value)} placeholder="Juan" maxLength={80} error={!!errors.firstName} autoComplete="given-name" />
                </Field>
                <Field label="Last name" htmlFor="account-lastName" required error={errors.lastName}>
                    <TextInput id="account-lastName" value={values.lastName} onChange={(e) => onChange("lastName", e.target.value)} placeholder="Dela Cruz" maxLength={80} error={!!errors.lastName} autoComplete="family-name" />
                </Field>
                <Field label="Employee number" htmlFor="account-employeeNo" required error={errors.employeeNo} hint="Staff or faculty ID number">
                    <TextInput id="account-employeeNo" value={values.employeeNo} onChange={(e) => onChange("employeeNo", e.target.value)} placeholder="EMP-2026-014" maxLength={30} error={!!errors.employeeNo} />
                </Field>
                <Field label="Email" htmlFor="account-email" required error={errors.email} hint="Used to sign in">
                    <TextInput id="account-email" type="email" value={values.email} onChange={(e) => onChange("email", e.target.value)} placeholder="name@school.edu" error={!!errors.email} autoComplete="email" />
                </Field>
            </FormSection>

            <FormSection title="Access">
                <Field label="Role" htmlFor="account-role" required error={errors.role}>
                    <SelectInput id="account-role" value={values.role} onChange={(e) => onChange("role", e.target.value as UserRole)} error={!!errors.role}>
                        <option value="" disabled>Select a role</option>
                        {USER_ROLES.map((role) => (
                            <option key={role} value={role}>{formatRole(role)}</option>
                        ))}
                    </SelectInput>
                </Field>
                {showStatus && (
                    <Field label="Status" htmlFor="account-status" hint="Inactive accounts cannot sign in">
                        <SelectInput id="account-status" value={values.status} onChange={(e) => onChange("status", e.target.value as RecordStatus)}>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </SelectInput>
                    </Field>
                )}
                {isInstructor && (
                    <Field label="Default room" htmlFor="account-defaultRoom" optional hint="Pre-fills the room picker on mobile approvals">
                        <SelectInput id="account-defaultRoom" value={values.defaultRoomId ?? ""} onChange={(e) => onChange("defaultRoomId", e.target.value || null)}>
                            <option value="">No default</option>
                            {rooms.filter((room) => !room.isStorage).map((room) => (
                                <option key={room.id} value={room.id}>{room.code} — {room.name}</option>
                            ))}
                        </SelectInput>
                    </Field>
                )}
                <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5 sm:col-span-2">
                    <input
                        type="checkbox"
                        checked={values.isEventCoordinator}
                        onChange={(e) => onChange("isEventCoordinator", e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                        <span className="font-medium text-slate-700">Event coordinator</span>
                        <span className="block text-xs text-slate-500">Can unlock event batch mode at the kiosk.</span>
                    </span>
                </label>
            </FormSection>
        </>
    );
}
