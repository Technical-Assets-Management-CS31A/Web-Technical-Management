import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Filter } from "lucide-react";

export type FilterOption = { value: string; label: string; count?: number };

export type FilterGroup = {
    key: string;
    label: string;
    /** Do not include an "all" option; clearing a group selects "" */
    options: FilterOption[];
    selected: string;
    onChange: (value: string) => void;
};

type SelectItemFiltersProps = {
    groups: FilterGroup[];
    onClearAll: () => void;
};

export default function SelectItemFilters({ groups, onClearAll }: SelectItemFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const active = groups.filter((group) => group.selected !== "");
    const buttonLabel =
        active.length === 0
            ? "Filters"
            : active.length === 1
                ? active[0].options.find((o) => o.value === active[0].selected)?.label ?? "Filters"
                : `${active.length} filters`;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={`flex min-w-[120px] items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 sm:min-w-[160px] sm:px-4 ${
                    isOpen || active.length > 0
                        ? "border-blue-500 text-blue-700 ring-4 ring-blue-500/10"
                        : "border-slate-300 text-slate-700 hover:border-blue-300 hover:text-blue-700"
                }`}
            >
                <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4 shrink-0" />
                    <span className="truncate">{buttonLabel}</span>
                    {active.length > 0 && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {active.length}
                        </span>
                    )}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg sm:w-72">
                    <div className="divide-y divide-slate-100">
                        {groups.map((group) => (
                            <div key={group.key} className="p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group.label}</span>
                                    {group.selected !== "" && (
                                        <button
                                            type="button"
                                            onClick={() => group.onChange("")}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    {group.options.map((option) => {
                                        const isSelected = group.selected === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                // Clicking the selected option again clears the group.
                                                onClick={() => group.onChange(isSelected ? "" : option.value)}
                                                aria-pressed={isSelected}
                                                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                                                    isSelected ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-100"
                                                }`}
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <span className="truncate">{option.label}</span>
                                                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                </span>
                                                {option.count !== undefined && (
                                                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
                                                        {option.count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {active.length > 0 && (
                            <div className="p-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClearAll();
                                        setIsOpen(false);
                                    }}
                                    className="w-full rounded-md px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
