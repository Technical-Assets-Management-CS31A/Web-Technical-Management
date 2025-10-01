const HistoryListSkeletonLoader = () => {
    return (
        <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
            <div className="w-full max-w-[90%] bg-white/90 shadow-2xl rounded-3xl p-8 relative">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <div className="h-10 w-80 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                        <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                <div className="flex flex-row justify-end gap-2 mb-6">
                    {/* Paginated Component */}

                    <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    {/* Search Bar Component */}
                    <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>

                {/* Table Container Skeleton */}
                <div className="h-[60vh] overflow-x-auto rounded-2xl shadow-lg bg-white/95">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr>
                                {[...Array(9)].map((_, index) => (
                                    <th key={index} className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(8)].map((_, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                                >
                                    {/* ID Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Item Name Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Borrowed ID Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Teacher Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Room Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Occupied By Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Condition Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Event Date Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                    {/* Status Column */}
                                    <td className="py-3 px-6">
                                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Description Skeleton */}
                <div className="mt-6 text-[#64748b] text-sm text-center">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default HistoryListSkeletonLoader;
