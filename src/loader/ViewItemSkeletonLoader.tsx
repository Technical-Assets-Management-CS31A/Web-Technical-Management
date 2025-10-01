export default function ViewItemSkeletonLoader() {
    return (
        <>
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="text-center mb-8">
                        <div className="h-8 bg-gray-200 rounded-lg w-80 mx-auto mb-2 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded-lg w-32 mx-auto animate-pulse"></div>
                    </div>

                    {/* Image Section Skeleton */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-center">
                            <div className="w-64 h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                    </div>

                    {/* Details Grid Skeleton - 3 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Serial Number Skeleton */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                        </div>

                        {/* Condition Skeleton */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-lg w-16 animate-pulse"></div>
                        </div>

                        {/* Item Make Skeleton */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                        </div>

                        {/* Item Type Skeleton */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-lg w-18 animate-pulse"></div>
                        </div>

                        {/* Item Model Skeleton */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-lg w-22 animate-pulse"></div>
                        </div>

                        {/* Date Added Skeleton */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded-lg w-28 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Description Skeleton - Full Width */}
                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                        <div className="h-6 bg-gray-200 rounded-lg w-32 mb-3 animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-4/5 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
