import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";
import type { SectionForm } from "../@types/types";
import { useAllSections, useAllUsers, useCreateSection } from "../hooks/userHooks";
import { fullName } from "../lib/utils";
import { showToast } from "./AppToast";
import { Field, FormAlert, FormDialog, FormSection, SelectInput, TextInput, getErrorMessage } from "./form/FormKit";
import { validateRequired } from "./form/validators";
import { currentSchoolYear, isValidSchoolYear } from "./rosterCsv";

// New section (POST /sections). Sections are unique on code + school year (PRD 7.3).
// The PRD has no edit or delete for sections, so this form only creates.

type Errors = Partial<Record<keyof SectionForm, string>>;

const YEAR_LEVELS = [1, 2, 3, 4, 5];

export default function SectionFormDialog({ onClose }: { onClose: () => void }) {
  const { data: sections = [] } = useQuery(useAllSections());
  const { data: users = [] } = useQuery(useAllUsers());
  const instructors = users.filter((u) => u.role === "INSTRUCTOR" && !u.deletedAt);
  const create = useCreateSection();

  const [values, setValues] = useState<SectionForm>({
    code: "",
    program: "",
    yearLevel: 1,
    schoolYear: currentSchoolYear(),
    adviserUserId: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  const onChange = <K extends keyof SectionForm>(key: K, value: SectionForm[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  };

  const code = values.code.trim().toUpperCase();
  const schoolYear = values.schoolYear.trim();
  const duplicate = sections.some((s) => s.code.toUpperCase() === code && s.schoolYear === schoolYear);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {
      code: validateRequired(code, "Section code") ?? (duplicate ? `${code} already exists for ${schoolYear}` : undefined),
      program: validateRequired(values.program, "Program"),
      schoolYear: validateRequired(schoolYear, "School year") ?? (isValidSchoolYear(schoolYear) ? undefined : "Use consecutive years, e.g. 2026-2027"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const data: SectionForm = { ...values, code, program: values.program.trim(), schoolYear };
    create.mutate(data, {
      onSuccess: () => {
        showToast.success("Section Added", `${code} · ${schoolYear}`);
        onClose();
      },
      onError: (err) => {
        const message = getErrorMessage(err, "Failed to add section.");
        setSubmitError(message);
        showToast.error("Add Failed", message);
      },
    });
  };

  return (
    <FormDialog
      title="New section"
      subtitle="Students are placed in a section by the roster form or CSV import"
      icon={Layers}
      size="md"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={create.isPending}
      submitLabel="Add section"
      footerNote={<><span className="text-rose-500">*</span> Required fields</>}
    >
      <FormSection title="Section">
        <Field label="Section code" htmlFor="section-code" required error={errors.code} hint="As it appears on the roster">
          <TextInput id="section-code" value={values.code} onChange={(e) => onChange("code", e.target.value)} placeholder="BSCS-2A" maxLength={20} error={!!errors.code} className="font-mono uppercase" />
        </Field>
        <Field label="School year" htmlFor="section-sy" required error={errors.schoolYear}>
          <TextInput id="section-sy" value={values.schoolYear} onChange={(e) => onChange("schoolYear", e.target.value)} placeholder="2026-2027" maxLength={9} error={!!errors.schoolYear} className="tabular-nums" />
        </Field>
        <Field label="Program" htmlFor="section-program" required error={errors.program}>
          <TextInput id="section-program" value={values.program} onChange={(e) => onChange("program", e.target.value)} placeholder="BS Computer Science" maxLength={120} error={!!errors.program} />
        </Field>
        <Field label="Year level" htmlFor="section-year">
          <SelectInput id="section-year" value={values.yearLevel} onChange={(e) => onChange("yearLevel", Number(e.target.value))}>
            {YEAR_LEVELS.map((level) => (
              <option key={level} value={level}>Year {level}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Adviser" htmlFor="section-adviser" optional hint="Shown on reports only" className="sm:col-span-2">
          <SelectInput id="section-adviser" value={values.adviserUserId ?? ""} onChange={(e) => onChange("adviserUserId", e.target.value || null)}>
            <option value="">No adviser</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>{fullName(instructor)} · {instructor.employeeNo}</option>
            ))}
          </SelectInput>
        </Field>
      </FormSection>

      {submitError && <FormAlert tone="error">{submitError}</FormAlert>}
    </FormDialog>
  );
}
