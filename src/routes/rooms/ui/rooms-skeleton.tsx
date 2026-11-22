import React from "react";

const Bone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className ?? ""}`} style={style} />
);

export const RoomsSkeletonLoader = () => {
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

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Rooms list */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
                        <div className="space-y-3 border-b border-slate-200 px-5 py-4">
                            <div className="flex items-center justify-between">
                                <Bone className="h-5 w-24" />
                                <Bone className="h-8 w-48" />
                            </div>
                            <Bone className="h-10 w-full" />
                        </div>
                        <div className="divide-y divide-slate-100">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-3">
                                    <Bone className="h-9 w-9" />
                                    <div className="flex-1 space-y-1.5">
                                        <Bone className="h-3.5 w-16" />
                                        <Bone className="h-3 w-40" />
                                    </div>
                                    <Bone className="h-3 w-8" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected room */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-3">
                        <div className="space-y-2 border-b border-slate-200 px-5 py-4">
                            <Bone className="h-6 w-24" />
                            <Bone className="h-4 w-48" />
                            <Bone className="h-3 w-32" />
                        </div>
                        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 px-5 py-4 sm:grid-cols-3">
                            <Bone className="h-16" />
                            <Bone className="h-16 sm:col-span-2" />
                        </div>
                        <div className="space-y-2 px-5 py-4">
                            <Bone className="h-4 w-28" />
                            {[...Array(3)].map((_, i) => (
                                <Bone key={i} className="h-11 w-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
