import { useState } from "react";
import { CircleUserRound } from "lucide-react";
import { useUpdateUser } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, TextInput, getErrorMessage } from "./form/FormKit";
import { validateEmail, validateRequired } from "./form/validators";
import type { UserDto } from "../@types/types";

type EditProfileModalProps = {
    user: UserDto;
    onClose: () => void;
};

type FieldKey = "firstName" | "lastName" | "email";
type Values = Record<FieldKey, string>;

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
    const { mutate, isPending } = useUpdateUser();
    const [submitError, setSubmitError] = useState("");
    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

    // Seeded once on open — re-seeding on every parent render would wipe what the user is typing
    const [values, setValues] = useState<Values>(() => ({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
    }));

    const update = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
        setSubmitError("");
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const next = {
            firstName: validateRequired(values.firstName, "First name"),
            lastName: validateRequired(values.lastName, "Last name"),
            email: validateEmail(values.email),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        // PUT replaces the whole record, so role and settings are sent back unchanged.
        mutate(
            {
                id: user.id,
                data: {
                    employeeNo: user.employeeNo,
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim(),
                    email: values.email.trim(),
                    role: user.role,
                    isEventCoordinator: user.isEventCoordinator,
                    defaultRoomId: user.defaultRoomId,
                    status: user.status,
                },
            },
            {
                onSuccess: () => {
                    showToast.success("Profile Updated", "Your profile was updated successfully.");
                    onClose();
                },
                onError: (err) => {
                    const message = getErrorMessage(err, "Failed to update profile.");
                    setSubmitError(message);
                    showToast.error("Update Failed", message);
                },
            },
        );
    }

    return (
        <FormDialog
            title="Edit Profile"
            subtitle="Update your personal information"
            icon={CircleUserRound}
            onClose={onClose}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            footerNote={<><span className="text-rose-500">*</span> Required fields</>}
        >
            <FormSection title="Personal information">
                <Field label="First name" htmlFor="profile-firstName" required error={errors.firstName}>
                    <TextInput id="profile-firstName" value={values.firstName} onChange={update("firstName")} placeholder="Juan" error={!!errors.firstName} autoComplete="given-name" />
                </Field>
                <Field label="Last name" htmlFor="profile-lastName" required error={errors.lastName}>
                    <TextInput id="profile-lastName" value={values.lastName} onChange={update("lastName")} placeholder="Dela Cruz" error={!!errors.lastName} autoComplete="family-name" />
                </Field>
            </FormSection>

            <FormSection title="Account">
                <Field label="Email" htmlFor="profile-email" required error={errors.email} hint="You sign in with this email.">
                    <TextInput id="profile-email" type="email" value={values.email} onChange={update("email")} placeholder="name@school.edu" error={!!errors.email} autoComplete="email" />
                </Field>
            </FormSection>

            {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
        </FormDialog>
    );
}
