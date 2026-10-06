import React, { useState } from "react";
import { UserPen } from "lucide-react";
import type { TUpdateUsers } from "../@types/types";
import { useUpdateUser } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired, validateEmail, validatePhone } from "./form/validators";

type TPathUserTypes = Omit<TUpdateUsers, "id">;

type EditItemProps = {
  onClose(): void;
  user: TUpdateUsers;
};

type FormData = {
  firstName: string;
  lastName: string;
  middleName: string;
  username: string;
  email: string;
  phoneNumber: string;
  position: string;
};

const positions = ["Intern", "Full-Time", "Part-Time", "Head-Staff"];

export default function EditUser({ user, onClose }: EditItemProps) {
  const { mutate, isPending } = useUpdateUser();
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [formData, setFormData] = useState<FormData>({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    middleName: user.middleName ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    position: user.position ?? "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const next: Partial<Record<keyof FormData, string>> = {
      firstName: validateRequired(formData.firstName, "First name"),
      lastName: validateRequired(formData.lastName, "Last name"),
      username: validateRequired(formData.username, "Username"),
      email: validateEmail(formData.email),
      phoneNumber: validatePhone(formData.phoneNumber, false),
      position: validateRequired(formData.position, "Position"),
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: TPathUserTypes = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      middleName: formData.middleName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      position: formData.position,
    };

    mutate(
      { id: user.id, data: payload },
      {
        onSuccess: () => {
          showToast.success("User Updated", "User profile updated successfully.");
          onClose();
        },
        onError: (error) => {
          // Keep the form open so the user can correct and retry
          const message = getErrorMessage(error, "You don't have permission to update this user.");
          setSubmitError(message);
          showToast.error("Update Failed", message);
        },
      },
    );
  };

  return (
    <FormDialog
      title="Edit User"
      subtitle={`Update ${user.firstName ?? "this user"}'s profile`}
      icon={UserPen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <FormSection title="Personal information" columns={3}>
        <Field label="First name" htmlFor="firstName" required error={errors.firstName}>
          <TextInput id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Juan" error={!!errors.firstName} autoComplete="given-name" />
        </Field>
        <Field label="Middle name" htmlFor="middleName" optional>
          <TextInput id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Santos" autoComplete="additional-name" />
        </Field>
        <Field label="Last name" htmlFor="lastName" required error={errors.lastName}>
          <TextInput id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Dela Cruz" error={!!errors.lastName} autoComplete="family-name" />
        </Field>
      </FormSection>

      <FormSection title="Account">
        <Field label="Username" htmlFor="username" required error={errors.username}>
          <TextInput id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="jdelacruz" error={!!errors.username} autoComplete="username" />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email}>
          <TextInput id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@school.edu" error={!!errors.email} autoComplete="email" />
        </Field>
        <Field label="Phone number" htmlFor="phoneNumber" optional error={errors.phoneNumber} hint="10 digits, e.g. 9171234567">
          <TextInput id="phoneNumber" name="phoneNumber" type="tel" inputMode="numeric" value={formData.phoneNumber} onChange={handleInputChange} placeholder="9XXXXXXXXX" maxLength={13} error={!!errors.phoneNumber} autoComplete="tel-national" />
        </Field>
        <Field label="Position" htmlFor="position" required error={errors.position}>
          <SelectInput id="position" name="position" value={formData.position} onChange={handleInputChange} error={!!errors.position}>
            <option value="" disabled>Select a position</option>
            {positions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </SelectInput>
        </Field>
      </FormSection>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
