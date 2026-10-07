interface GuestBorrowStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  steps: { label: string }[];
}

export const GuestBorrowStepIndicator = ({
  currentStep,
  steps,
}: GuestBorrowStepIndicatorProps) => {
  return (
    <div className="flex items-start justify-center mb-8 pb-6 border-b border-slate-100 overflow-x-auto">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-start">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-200 ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isActive
                    ? "bg-white text-blue-600 border-2 border-blue-600"
                    : "bg-white text-slate-400 border border-slate-300"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                  isActive ? "text-slate-900" : isCompleted ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`w-10 sm:w-16 md:w-24 h-px mx-2 mt-4 shrink-0 transition-colors duration-200 ${
                  isCompleted ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
