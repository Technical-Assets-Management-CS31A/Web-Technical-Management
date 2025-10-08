const ArchiveSkeletonLoader = () => {
    return (
        <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col">
            {/* Header Skeleton */}
            <header className="archive-header pt-8 px-8 pb-8 bg-white/80 shadow-lg rounded-b-3xl flex flex-col items-center">
                <div className="h-12 w-80 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse"></div>
            </header>

            {/* Archive Table Container Skeleton */}
            <section className="px-8 py-6">
                <div className="bg-white/90 h-[70vh] py-4 px-4 rounded-3xl shadow-2xl border border-[#e0e7ef] overflow-x-auto">
                    {/* Table Header Section */}
                    <div className="px-6 py-4 border-b border-gray-200 mb-4">
                        <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                        <div className="h-4 w-80 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="w-full">
                        {/* Table Header Skeleton */}
                        <div className="w-full border-collapse">
                            <div className="sticky -top-4 bg-gray-50">
                                <div className="flex">
                                    {/* Serial Number */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Image */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Item Name */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Item Type */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-18 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Item Model */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Item Make */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-18 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Description */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Category */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Condition */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Bar Code */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Created At */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex-1 py-3 px-4 border-b border-gray-200">
                                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Rows Skeleton */}
                            <div className="mt-4">
                                {[...Array(8)].map((_, rowIndex) => (
                                    <div key={rowIndex} className="flex py-3 px-4 border-b border-gray-100 hover:bg-gray-50">
                                        {/* Serial Number */}
                                        <div className="flex-1">
                                            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Image */}
                                        <div className="flex-1">
                                            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                                        </div>
                                        {/* Item Name */}
                                        <div className="flex-1">
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Item Type */}
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Item Model */}
                                        <div className="flex-1">
                                            <div className="h-4 w-22 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Item Make */}
                                        <div className="flex-1">
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Description */}
                                        <div className="flex-1">
                                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Category */}
                                        <div className="flex-1">
                                            <div className="h-4 w-18 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Condition */}
                                        <div className="flex-1">
                                            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                                        </div>
                                        {/* Bar Code */}
                                        <div className="flex-1">
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Created At */}
                                        <div className="flex-1">
                                            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex-1">
                                            <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
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

export default ArchiveSkeletonLoader;
