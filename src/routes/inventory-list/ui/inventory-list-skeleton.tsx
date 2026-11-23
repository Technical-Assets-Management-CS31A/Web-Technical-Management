const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

// Mirrors inventory-list-view.tsx and InventoryTable: Asset, Category, Type, Condition, Room, Status, actions.
const InventoryListSkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <Bone className="h-7 w-36" />
                        <Bone className="h-3.5 w-80 max-w-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Bone className="h-9 w-28" />
                        <Bone className="h-9 w-9" />
                    </div>
                </div>

                {/* ── Summary ────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
                            <div className="space-y-2">
                                <Bone className="h-3.5 w-24" />
                                <Bone className="h-7 w-14" />
                                <Bone className="h-3 w-20" />
                            </div>
                            <Bone className="hidden h-10 w-10 sm:block" />
                        </div>
                    ))}
                </div>

                {/* ── Table card ─────────────────────────────────────────── */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* Toolbar: title + count, then search, room, filters, sort; quick chips below */}
                    <div className="space-y-4 border-b border-slate-200 px-5 py-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-1.5">
                                <Bone className="h-4 w-20" />
                                <Bone className="h-3.5 w-28" />
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                                <Bone className="h-[42px] w-full rounded-xl sm:w-[280px]" />
                                <Bone className="h-[42px] w-40" />
                                <Bone className="h-[42px] w-28" />
                                <Bone className="h-[42px] w-36" />
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-hidden">
                            {[64, 88, 76, 96, 72, 84].map((w, i) => (
                                <Bone key={i} className="h-7 shrink-0 rounded-full" style={{ width: w }} />
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <div className="min-h-[50vh]">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {[48, 64, 40, 64, 44, 48, 0].map((w, i) => (
                                            <th key={i} className="border-b border-slate-200 px-5 py-3 text-left">
                                                {w > 0 && <Bone className="h-3 rounded" style={{ width: w }} />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...Array(8)].map((_, rowIdx) => (
                                        <tr key={rowIdx}>
                                            {/* Asset */}
                                            <td className="px-5 py-3">
                                                <div className="space-y-1.5">
                                                    <Bone className="h-3.5 w-36" />
                                                    <Bone className="h-3 w-20" />
                                                </div>
                                            </td>
                                            {/* Category */}
                                            <td className="px-5 py-3"><Bone className="h-3.5 w-24" /></td>
                                            {/* Type */}
                                            <td className="px-5 py-3"><Bone className="h-3.5 w-20" /></td>
                                            {/* Condition */}
                                            <td className="px-5 py-3"><Bone className="h-5 w-16 rounded" /></td>
                                            {/* Room */}
                                            <td className="px-5 py-3"><Bone className="h-3 w-14" /></td>
                                            {/* Status */}
                                            <td className="px-5 py-3"><Bone className="h-5 w-20 rounded" /></td>
                                            {/* Actions */}
                                            <td className="px-5 py-3"><Bone className="ml-auto h-7 w-7 rounded-md" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row">
                        <Bone className="h-4 w-40" />
                        <div className="flex items-center gap-1">
                            <Bone className="h-9 w-20 rounded-xl" />
                            <Bone className="h-9 w-9 rounded-xl" />
                            <Bone className="h-9 w-9 rounded-xl" />
                            <Bone className="h-9 w-16 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryListSkeletonLoader;
