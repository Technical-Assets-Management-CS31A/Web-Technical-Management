import React from "react";

const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

export const UserSkeletonLoader = () => {
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
                    <Bone className="h-10 w-32" />
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

                {/* Tabs */}
                <Bone className="h-11 w-96 max-w-full" />

                {/* Table card */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1.5">
                            <Bone className="h-5 w-48" />
                            <Bone className="h-3 w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Bone className="h-8 w-40" />
                            <Bone className="h-8 w-28" />
                            <Bone className="h-9 w-56" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    {[60, 60, 50, 60, 0].map((w, i) => (
                                        <th key={i} className="border-b border-slate-200 px-5 py-3 text-left">
                                            {w > 0 && <Bone className="h-3 rounded" style={{ width: w }} />}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[...Array(8)].map((_, rowIdx) => (
                                    <tr key={rowIdx}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <Bone className="h-9 w-9 rounded-full" />
                                                <div className="space-y-1.5">
                                                    <Bone className="h-3.5 w-32" />
                                                    <Bone className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Bone className="h-3.5 w-44" />
                                        </td>
                                        <td className="px-5 py-3">
                                            <Bone className="h-5 w-16 rounded-md" />
                                        </td>
                                        <td className="px-5 py-3">
                                            <Bone className="h-5 w-20 rounded-full" />
                                        </td>
                                        <td className="px-5 py-3">
                                            <Bone className="ml-auto h-8 w-8" />
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
