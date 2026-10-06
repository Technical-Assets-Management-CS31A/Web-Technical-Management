import React, { useState } from "react";
import { Presentation } from "lucide-react";
import type { TUpdatedTeacher } from "../@types/types";
import { useUpdateTeacher } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired } from "./form/validators";

type EditTeacherProps = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  department: string;
  onClose: () => void;
};

export const EditTeacher = ({
  id,
  firstName,
  middleName,
  lastName,
  department,
  onClose,
}: EditTeacherProps) => {
  const { mutate, isPending } = useUpdateTeacher();
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TUpdatedTeacher, string>>>({});

  const [formData, setFormData] = useState<TUpdatedTeacher>({
    firstName: firstName ?? "",
    middleName: middleName ?? "",
    lastName: lastName ?? "",
    department: department ?? "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next = {
      firstName: validateRequired(formData.firstName, "First name"),
      lastName: validateRequired(formData.lastName, "Last name"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    mutate(
      {
        id,
        data: {
          firstName: formData.firstName.trim(),
          middleName: formData.middleName?.trim() ?? "",
          lastName: formData.lastName.trim(),
          department: formData.department?.trim() ?? "",
        },
      },
      {
        onSuccess: (data) => {
          showToast.success("Teacher Updated", data?.message || "Teacher updated successfully.");
          onClose();
        },
        onError: (error) => {
          const message = getErrorMessage(error, "Failed to update teacher.");
          setSubmitError(message);
          showToast.error("Update Failed", message);
        },
      },
    );
  };

  return (
    <FormDialog
      title="Edit Teacher"
      subtitle="Update teacher information"
      icon={Presentation}
      size="md"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <FormSection title="Personal information">
        <Field label="First name" htmlFor="firstName" required error={errors.firstName}>
          <TextInput id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Juan" error={!!errors.firstName} />
        </Field>
        <Field label="Last name" htmlFor="lastName" required error={errors.lastName}>
          <TextInput id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Dela Cruz" error={!!errors.lastName} />
        </Field>
        <Field label="Middle name" htmlFor="middleName" optional className="sm:col-span-2">
          <TextInput id="middleName" name="middleName" value={formData.middleName ?? ""} onChange={handleInputChange} placeholder="Santos" />
        </Field>
      </FormSection>

      <FormSection title="Teaching" columns={1}>
        <Field label="Department" htmlFor="department" optional>
          <TextInput id="department" name="department" value={formData.department ?? ""} onChange={handleInputChange} placeholder="e.g. College of Computer Studies" />
        </Field>
      </FormSection>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
};
