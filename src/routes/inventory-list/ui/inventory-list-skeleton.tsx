const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

const InventoryListSkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

                {/* Header */}
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

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
                            <div className="space-y-3">
                                <Bone className="h-3.5 w-24" />
                                <Bone className="h-7 w-14" />
                            </div>
                            <Bone className="hidden h-10 w-10 sm:block" />
                        </div>
                    ))}
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                    {/* Toolbar */}
                    <div className="space-y-4 border-b border-slate-200 px-5 py-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-1.5">
                                <Bone className="h-4 w-20" />
                                <Bone className="h-3.5 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Bone className="h-10 w-72 max-w-full rounded-xl" />
                                <Bone className="h-10 w-40" />
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-hidden">
                            {[56, 96, 80, 104, 72].map((w, i) => (
                                <Bone key={i} className="h-7 shrink-0 rounded-full" style={{ width: w }} />
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <div className="max-h-[60vh] min-h-[50vh] overflow-y-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        {[160, 80, 70, 110, 70, 60].map((w, i) => (
                                            <th key={i} className="px-5 py-3 text-left">
                                                <Bone className="h-3 rounded" style={{ width: w }} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[...Array(8)].map((_, rowIdx) => (
                                        <tr key={rowIdx}>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Bone className="h-10 w-10" />
                                                    <div className="space-y-1.5">
                                                        <Bone className="h-3.5 w-36" />
                                                        <Bone className="h-3 w-24" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3"><Bone className="h-3.5 w-20" /></td>
                                            <td className="px-5 py-3"><Bone className="h-5 w-14 rounded" /></td>
                                            <td className="px-5 py-3"><Bone className="h-3.5 w-28" /></td>
                                            <td className="px-5 py-3"><Bone className="h-5 w-16 rounded" /></td>
                                            <td className="px-5 py-3"><Bone className="ml-auto h-7 w-20 rounded-md" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryListSkeletonLoader;
