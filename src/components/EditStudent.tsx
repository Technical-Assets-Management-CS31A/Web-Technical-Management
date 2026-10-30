import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import type { RecordStatus, StudentDto, StudentForm } from "../@types/types";
import { useAllSections, useCreateStudent, useUpdateStudent } from "../hooks/userHooks";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired } from "./form/validators";

// Short roster form: students have no account and prove identity by fingerprint at the kiosk.

type EditStudentProps = {
  /** Omit to create a new student */
  student?: StudentDto;
  onClose: () => void;
};

type Errors = Partial<Record<keyof StudentForm, string>>;

export const EditStudent = ({ student, onClose }: EditStudentProps) => {
  const isNew = !student;
  const { data: sections = [] } = useQuery(useAllSections());
  const create = useCreateStudent();
  const update = useUpdateStudent();
  const isPending = create.isPending || update.isPending;

  const [values, setValues] = useState<StudentForm>({
    studentNo: student?.studentNo ?? "",
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    sectionId: student?.section?.id ?? "",
    status: student?.status ?? "ACTIVE",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  const onChange = <K extends keyof StudentForm>(key: K, value: StudentForm[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: Errors = {
      studentNo: validateRequired(values.studentNo, "Student number"),
      firstName: validateRequired(values.firstName, "First name"),
      lastName: validateRequired(values.lastName, "Last name"),
      sectionId: validateRequired(values.sectionId, "Section"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const data: StudentForm = {
      ...values,
      studentNo: values.studentNo.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    };
    const callbacks = {
      onSuccess: () => {
        showToast.success(isNew ? "Student Added" : "Student Updated", `${data.firstName} ${data.lastName} is on the roster.`);
        onClose();
      },
      onError: (err: unknown) => {
        const message = getErrorMessage(err, isNew ? "Failed to add student." : "Failed to update student.");
        setSubmitError(message);
        showToast.error(isNew ? "Add Failed" : "Update Failed", message);
      },
    };

    if (student) update.mutate({ id: student.id, data }, callbacks);
    else create.mutate(data, callbacks);
  };

  return (
    <FormDialog
      title={isNew ? "Add student" : "Edit student"}
      subtitle={isNew ? "Roster record" : `${student.firstName} ${student.lastName}`}
      icon={GraduationCap}
      size="md"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel={isNew ? "Add student" : "Save changes"}
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <FormSection title="Student">
        <Field label="Student number" htmlFor="student-no" required error={errors.studentNo} className="sm:col-span-2">
          <TextInput id="student-no" value={values.studentNo} onChange={(e) => onChange("studentNo", e.target.value)} placeholder="2024-00123" maxLength={20} error={!!errors.studentNo} className="font-mono" />
        </Field>
        <Field label="First name" htmlFor="student-firstName" required error={errors.firstName}>
          <TextInput id="student-firstName" value={values.firstName} onChange={(e) => onChange("firstName", e.target.value)} placeholder="Juan" error={!!errors.firstName} />
        </Field>
        <Field label="Last name" htmlFor="student-lastName" required error={errors.lastName}>
          <TextInput id="student-lastName" value={values.lastName} onChange={(e) => onChange("lastName", e.target.value)} placeholder="Dela Cruz" error={!!errors.lastName} />
        </Field>
        <Field label="Section" htmlFor="student-section" required error={errors.sectionId}>
          <SelectInput id="student-section" value={values.sectionId} onChange={(e) => onChange("sectionId", e.target.value)} error={!!errors.sectionId}>
            <option value="" disabled>Select a section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.code} · {section.schoolYear}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Status" htmlFor="student-status">
          <SelectInput id="student-status" value={values.status} onChange={(e) => onChange("status", e.target.value as RecordStatus)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </SelectInput>
        </Field>
      </FormSection>

      {isNew && <FormAlert tone="success">Enroll the student's fingerprint at the kiosk after saving so they can borrow.</FormAlert>}
      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
};
