import React from "react";

const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

/** What one table cell looks like while loading. */
export type SkeletonCell =
    | "avatar"   // round avatar + name and sub line
    | "icon"     // square icon + one line
    | "stack"    // two stacked lines
    | "text"     // one line
    | "mono"     // one short line
    | "pill"     // status pill
    | "count"    // short number
    | "expand"   // narrow chevron column at the start of a row
    | "action";  // trailing actions column

type Props = {
    /** Primary button at the top right of the header (filled), outlined, or none. */
    action?: "primary" | "outline" | false;
    /** Segmented page tabs between the summary cards and the table (User Management). */
    tabs?: boolean;
    /** Left side of the table toolbar: a heading, or a segmented view switch. */
    toolbar?: "title" | "segmented";
    /** Small boxes in the toolbar before the search field (segmented filters, selects). */
    filters?: number[];
    columns?: SkeletonCell[];
};

const HEADER_WIDTH: Record<SkeletonCell, number> = {
    avatar: 64, icon: 72, stack: 64, text: 56, mono: 40, pill: 48, count: 52, expand: 0, action: 0,
};

const Cell = ({ kind }: { kind: SkeletonCell }) => {
    switch (kind) {
        case "avatar":
            return (
                <div className="flex items-center gap-3">
                    <Bone className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                        <Bone className="h-3.5 w-32" />
                        <Bone className="h-3 w-20" />
                    </div>
                </div>
            );
        case "icon":
            return (
                <div className="flex items-center gap-2.5">
                    <Bone className="h-8 w-8 shrink-0" />
                    <Bone className="h-3.5 w-24" />
                </div>
            );
        case "stack":
            return (
                <div className="space-y-1.5">
                    <Bone className="h-3.5 w-28" />
                    <Bone className="h-3 w-20" />
                </div>
            );
        case "text":
            return <Bone className="h-3.5 w-36" />;
        case "mono":
            return <Bone className="h-3.5 w-14" />;
        case "pill":
            return <Bone className="h-5 w-20 rounded-full" />;
        case "count":
            return <Bone className="h-3.5 w-6" />;
        case "expand":
            return <Bone className="h-6 w-6 rounded-md" />;
        case "action":
            return <Bone className="ml-auto h-7 w-20 rounded-md" />;
    }
};

// Defaults describe User Management (accounts tab); other list pages pass their own layout.
export const UserSkeletonLoader = ({
    action = "primary",
    tabs = true,
    toolbar = "title",
    filters = [160, 112],
    columns = ["avatar", "text", "pill", "pill", "mono", "action"],
}: Props) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">
                {/* Header */}
                <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mt-0">
                    <div className="space-y-2">
                        <Bone className="h-3 w-28 rounded-full" />
                        <Bone className="h-7 w-56" />
                        <Bone className="h-4 w-96 max-w-full" />
                    </div>
                    {action === "primary" && <Bone className="h-10 w-32" />}
                    {action === "outline" && <div className="h-10 w-40 animate-pulse rounded-lg border border-slate-200 bg-white" />}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
                            <div className="space-y-2">
                                <Bone className="h-3.5 w-24" />
                                <Bone className="h-7 w-12" />
                                <Bone className="h-3 w-16" />
                            </div>
                            <Bone className="h-10 w-10" />
                        </div>
                    ))}
                </div>

                {/* Page tabs */}
                {tabs && <Bone className="h-11 w-full sm:w-96" />}

                {/* Table card */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        {toolbar === "title" ? (
                            <div className="space-y-1.5">
                                <Bone className="h-5 w-48" />
                                <Bone className="h-3 w-20" />
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <Bone className="h-8 w-44" />
                                <Bone className="h-3 w-20" />
                            </div>
                        )}
                        <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center">
                            {filters.map((w, i) => (
                                <Bone key={i} className="h-8" style={{ width: w }} />
                            ))}
                            <Bone className="h-10 w-full rounded-xl sm:w-[280px]" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-h-[45vh]">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {columns.map((kind, i) => (
                                            <th key={i} className={`border-b border-slate-200 py-3 text-left ${kind === "expand" ? "w-10 pl-5" : "px-5"}`}>
                                                {HEADER_WIDTH[kind] > 0 && <Bone className="h-3 rounded" style={{ width: HEADER_WIDTH[kind] }} />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...Array(8)].map((_, rowIdx) => (
                                        <tr key={rowIdx}>
                                            {columns.map((kind, i) => (
                                                <td key={i} className={`py-3 ${kind === "expand" ? "pl-5" : "px-5"}`}>
                                                    <Cell kind={kind} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer hint */}
                    <div className="flex items-start gap-2 border-t border-slate-200 px-5 py-3">
                        <Bone className="h-3.5 w-3.5 shrink-0 rounded-full" />
                        <Bone className="h-3 w-96 max-w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};
