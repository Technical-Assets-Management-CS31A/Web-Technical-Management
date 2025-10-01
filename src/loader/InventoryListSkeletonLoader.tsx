const InventoryListSkeletonLoader = () => {
    return (
        <div className="animate-fadeIn inventory-list-container min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col">
            {/* Header Skeleton */}
            <header className="inventory-header pt-8 px-8 pb-8 bg-white/80 shadow-lg rounded-b-3xl flex flex-col items-center">
                <div className="h-12 w-80 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse"></div>
            </header>

            {/* Stats Grid Skeleton */}
            <section className="inventory-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 pt-6 pb-8">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center border border-[#e0e7ef]">
                        <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                        <div className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                ))}
            </section>

            {/* Table Container Skeleton */}
            <section className="px-8">
                <div className="bg-white/90 h-[55vh] py-4 px-4 rounded-3xl shadow-2xl border border-[#e0e7ef] overflow-x-auto">
                    <section className="mb-4 flex justify-between">
                        <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="flex flex-row gap-2">
                            {/* Paginated Component */}
                            <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                            {/* Search Bar Component */}
                            <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                    </section>

                    {/* Table Skeleton */}
                    <div className="w-full">
                        {/* Table Header Skeleton */}
                        <div className="w-full border-collapse">
                            <div className="sticky -top-4 bg-[#f8fafc]">
                                <div className="flex">
                                    {[...Array(7)].map((_, index) => (
                                        <div key={index} className="flex-1 py-4 px-4 border-b border-[#e6e6e6]">
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Table Rows Skeleton */}
                            <div className="mt-4">
                                {[...Array(5)].map((_, rowIndex) => (
                                    <div key={rowIndex} className="flex py-3 px-4 border-b border-gray-100">
                                        {/* Serial Number */}
                                        <div className="flex-1">
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Image */}
                                        <div className="flex-1">
                                            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                                        </div>
                                        {/* Name */}
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Type */}
                                        <div className="flex-1">
                                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Category */}
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Condition */}
                                        <div className="flex-1">
                                            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex-1 flex gap-2">
                                            <div className="h-8 w-16 bg-gray-200 rounded-xl animate-pulse"></div>
                                            <div className="h-8 w-8 bg-gray-200 rounded-xl animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InventoryListSkeletonLoader;
