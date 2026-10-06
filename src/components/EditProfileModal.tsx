import { useState } from "react";
import { CircleUserRound } from "lucide-react";
import { useUpdateUser } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, TextInput, getErrorMessage } from "./form/FormKit";
import { validateEmail, validatePhone, validateRequired } from "./form/validators";

export type EditableUser = {
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    username?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    position?: string | null;
};

type EditProfileModalProps = {
    initialValues: EditableUser;
    onClose: () => void;
    onSubmit?: (values: EditableUser) => Promise<void> | void;
};

type Values = Required<{ [K in keyof EditableUser]: string }>;
type FieldKey = "firstName" | "lastName" | "middleName" | "username" | "email" | "phoneNumber";

export default function EditProfileModal({ initialValues, onClose, onSubmit }: EditProfileModalProps) {
    const { mutate, isPending } = useUpdateUser();
    const [submitError, setSubmitError] = useState("");
    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

    // Seeded once on open — re-seeding on every parent render would wipe what the user is typing
    const [values, setValues] = useState<Values>(() => ({
        id: initialValues.id ?? "",
        firstName: initialValues.firstName ?? "",
        lastName: initialValues.lastName ?? "",
        middleName: initialValues.middleName ?? "",
        username: initialValues.username ?? "",
        email: initialValues.email ?? "",
        phoneNumber: initialValues.phoneNumber ?? "",
        position: initialValues.position ?? "",
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
            username: validateRequired(values.username, "Username"),
            email: validateEmail(values.email),
            phoneNumber: validatePhone(values.phoneNumber, false),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        mutate(
            {
                id: values.id,
                data: {
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim(),
                    middleName: values.middleName.trim(),
                    username: values.username.trim(),
                    email: values.email.trim(),
                    phoneNumber: values.phoneNumber.trim(),
                    position: values.position,
                },
            },
            {
                onSuccess: () => {
                    onSubmit?.(values);
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
                <Field label="Middle name" htmlFor="profile-middleName" optional>
                    <TextInput id="profile-middleName" value={values.middleName} onChange={update("middleName")} placeholder="Santos" autoComplete="additional-name" />
                </Field>
                <Field label="Phone number" htmlFor="profile-phone" optional error={errors.phoneNumber} hint="e.g. 09171234567">
                    <TextInput id="profile-phone" type="tel" inputMode="numeric" value={values.phoneNumber} onChange={update("phoneNumber")} placeholder="09XX XXX XXXX" maxLength={13} error={!!errors.phoneNumber} autoComplete="tel-national" />
                </Field>
            </FormSection>

            <FormSection title="Account">
                <Field label="Username" htmlFor="profile-username" required error={errors.username}>
                    <TextInput id="profile-username" value={values.username} onChange={update("username")} placeholder="jdelacruz" error={!!errors.username} autoComplete="username" />
                </Field>
                <Field label="Email" htmlFor="profile-email" required error={errors.email}>
                    <TextInput id="profile-email" type="email" value={values.email} onChange={update("email")} placeholder="name@school.edu" error={!!errors.email} autoComplete="email" />
                </Field>
            </FormSection>

            {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
        </FormDialog>
    );
}
