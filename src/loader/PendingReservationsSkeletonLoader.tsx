const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

const PendingReservationsSkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

                {/* Header */}
                <div className="space-y-2">
                    <Bone className="h-7 w-60" />
                    <Bone className="h-3.5 w-96 max-w-full" />
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
                            <div className="space-y-3">
                                <Bone className="h-3.5 w-32" />
                                <Bone className="h-7 w-12" />
                            </div>
                            <Bone className="h-10 w-10" />
                        </div>
                    ))}
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-end justify-between border-b border-slate-200 px-5 pb-3 pt-4">
                        <div className="flex gap-6">
                            <Bone className="h-5 w-36" />
                            <Bone className="h-5 w-44" />
                        </div>
                        <Bone className="hidden h-10 w-72 rounded-xl lg:block" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    {[160, 120, 50, 110, 110, 60, 80, 140].map((w, i) => (
                                        <th key={i} className="px-5 py-3 text-left">
                                            <Bone className="h-3 rounded" style={{ width: w }} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[...Array(6)].map((_, rowIdx) => (
                                    <tr key={rowIdx}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <Bone className="h-10 w-10" />
                                                <div className="space-y-1.5">
                                                    <Bone className="h-3.5 w-32" />
                                                    <Bone className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="space-y-1.5">
                                                <Bone className="h-3.5 w-28" />
                                                <Bone className="h-3 w-24" />
                                            </div>
                                        </td>
                                        <td className="px-5 py-3"><Bone className="h-3.5 w-10" /></td>
                                        <td className="px-5 py-3"><Bone className="h-3.5 w-28" /></td>
                                        <td className="px-5 py-3"><Bone className="h-3.5 w-28" /></td>
                                        <td className="px-5 py-3"><Bone className="h-5 w-16 rounded" /></td>
                                        <td className="px-5 py-3"><Bone className="h-3.5 w-20" /></td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Bone className="h-7 w-20 rounded-md" />
                                                <Bone className="h-7 w-16 rounded-md" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingReservationsSkeletonLoader;
