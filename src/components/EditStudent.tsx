import React, { useState } from "react";
import { GraduationCap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { TStudentRfidSession, TUpdateStudent } from "../@types/types";
import { useUpdateStudent } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import {
  cancelStudentRfidSessionApi,
  createStudentRfidSessionApi,
  getStudentRfidSessionApi,
} from "../api/user_api";
import { Field, FormAlert, FormDialog, FormSection, TextInput, getErrorMessage } from "./form/FormKit";
import { RfidRegistrationPanel, useRfidSession } from "./form/RfidRegistration";
import { validateEmail, validatePhone, validateRequired } from "./form/validators";

type StudentFields = {
  firstName: string;
  middleName: string;
  lastName: string;
  studentIdNumber: string;
  course: string;
  section: string;
  year: string;
  phoneNumber: string;
  email: string;
  username: string;
  street: string;
  cityMunicipality: string;
  province: string;
  postalCode: string;
};

type FieldKey = keyof StudentFields;

const REQUIRED: { key: FieldKey; label: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "studentIdNumber", label: "Student ID number" },
  { key: "course", label: "Course" },
  { key: "section", label: "Section" },
  { key: "year", label: "Year level" },
  { key: "username", label: "Username" },
  { key: "street", label: "Street address" },
  { key: "cityMunicipality", label: "City / municipality" },
  { key: "province", label: "Province" },
  { key: "postalCode", label: "Postal code" },
];

export const EditStudent = ({
  id,
  firstName,
  middleName,
  lastName,
  studentIdNumber,
  phoneNumber,
  course,
  section,
  year,
  street,
  cityMunicipality,
  province,
  postalCode,
  username,
  email,
  userRole,
  status,
  rfidUid,
  onClose,
}: TUpdateStudent) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateStudent();
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const [formData, setFormData] = useState<StudentFields>({
    firstName: firstName ?? "",
    middleName: middleName ?? "",
    lastName: lastName ?? "",
    studentIdNumber: studentIdNumber ?? "",
    course: course ?? "",
    section: section ?? "",
    year: year ?? "",
    phoneNumber: phoneNumber ?? "",
    email: email ?? "",
    username: username ?? "",
    street: street ?? "",
    cityMunicipality: cityMunicipality ?? "",
    province: province ?? "",
    postalCode: postalCode ?? "",
  });

  const rfid = useRfidSession<TStudentRfidSession>({
    createSession: () => createStudentRfidSessionApi(id),
    fetchSession: getStudentRfidSessionApi,
    cancelSession: cancelStudentRfidSessionApi,
    retryCreate: true,
    onCompleted: () => {
      showToast.success("RFID Registered", `RFID card assigned to ${firstName} ${lastName} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    for (const { key, label } of REQUIRED) next[key] = validateRequired(formData[key], label);
    next.email = validateEmail(formData.email);
    next.phoneNumber = validatePhone(formData.phoneNumber, true);
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const trimmed = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, v.trim()]),
    ) as StudentFields;

    mutate(
      {
        id,
        data: {
          ...trimmed,
          id,
          userRole,
          status,
          // Pictures aren't edited here; the API only uploads File values, so null leaves them unchanged
          frontStudentIdPicture: null,
          backStudentIdPicture: null,
          profilePicture: null,
        },
      },
      {
        onSuccess: () => {
          showToast.success("Student Updated", "Student updated successfully!");
          onClose();
        },
        onError: (error) => {
          const message = getErrorMessage(error, "Failed to update student.");
          setSubmitError(message);
          showToast.error("Update Failed", message);
        },
      },
    );
  };

  const input = (key: FieldKey, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <TextInput
      id={key}
      name={key}
      value={formData[key]}
      onChange={handleInputChange}
      error={!!errors[key]}
      {...props}
    />
  );

  return (
    <FormDialog
      title="Edit Student"
      subtitle={`Update ${firstName ?? "student"}'s information`}
      icon={GraduationCap}
      size="xl"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      preventClose={rfid.isActive}
      footerNote={
        rfid.isActive ? "Finish or cancel the RFID scan before closing." : <><span className="text-rose-500">*</span> Required fields</>
      }
    >
      <FormSection title="Personal information" columns={3}>
        <Field label="First name" htmlFor="firstName" required error={errors.firstName}>
          {input("firstName", { placeholder: "Juan", autoComplete: "given-name" })}
        </Field>
        <Field label="Middle name" htmlFor="middleName" optional>
          {input("middleName", { placeholder: "Santos", autoComplete: "additional-name" })}
        </Field>
        <Field label="Last name" htmlFor="lastName" required error={errors.lastName}>
          {input("lastName", { placeholder: "Dela Cruz", autoComplete: "family-name" })}
        </Field>
      </FormSection>

      <FormSection title="Academic">
        <Field label="Student ID number" htmlFor="studentIdNumber" required error={errors.studentIdNumber}>
          {input("studentIdNumber", { placeholder: "e.g. 2024-00123", className: "font-mono" })}
        </Field>
        <Field label="Course" htmlFor="course" required error={errors.course}>
          {input("course", { placeholder: "e.g. BSIT" })}
        </Field>
        <Field label="Year level" htmlFor="year" required error={errors.year}>
          {input("year", { placeholder: "e.g. 3rd Year" })}
        </Field>
        <Field label="Section" htmlFor="section" required error={errors.section}>
          {input("section", { placeholder: "e.g. A" })}
        </Field>
      </FormSection>

      <FormSection title="Contact & account">
        <Field label="Phone number" htmlFor="phoneNumber" required error={errors.phoneNumber} hint="e.g. 09171234567">
          {input("phoneNumber", { type: "tel", inputMode: "numeric", placeholder: "09XX XXX XXXX", maxLength: 13 })}
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email}>
          {input("email", { type: "email", placeholder: "name@school.edu", autoComplete: "email" })}
        </Field>
        <Field label="Username" htmlFor="username" required error={errors.username} className="sm:col-span-2">
          {input("username", { placeholder: "jdelacruz", autoComplete: "username" })}
        </Field>
      </FormSection>

      <FormSection title="Address" columns={3}>
        <Field label="Street address" htmlFor="street" required error={errors.street} className="sm:col-span-3">
          {input("street", { placeholder: "House no., street, barangay", autoComplete: "street-address" })}
        </Field>
        <Field label="City / municipality" htmlFor="cityMunicipality" required error={errors.cityMunicipality}>
          {input("cityMunicipality", { placeholder: "City", autoComplete: "address-level2" })}
        </Field>
        <Field label="Province" htmlFor="province" required error={errors.province}>
          {input("province", { placeholder: "Province", autoComplete: "address-level1" })}
        </Field>
        <Field label="Postal code" htmlFor="postalCode" required error={errors.postalCode}>
          {input("postalCode", { placeholder: "e.g. 6000", inputMode: "numeric", autoComplete: "postal-code" })}
        </Field>
      </FormSection>

      <section>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">RFID card</h3>
        <RfidRegistrationPanel
          noun="card"
          subject="student"
          currentUid={rfidUid}
          status={rfid.status}
          expiresAt={rfid.session?.expiresAt}
          waitingHint="Ask the student to tap their card on the reader."
          onStart={rfid.start}
          onCancel={rfid.cancel}
        />
      </section>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
};
