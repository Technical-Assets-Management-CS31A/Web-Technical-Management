export default function SidebarSkeletonLoader() {
  return (
    <aside className="animate-fadeIn h-screen w-[75px] bg-white border-r border-[#e5e7eb] flex flex-col justify-between shadow-xl left-0 top-0 z-30">
      {/* Logo and Title Skeleton */}
      <div className="flex flex-col items-center py-8">
        {/* Logo skeleton */}
        <div className="w-20 h-20 mb-2 bg-gray-200 rounded-full animate-pulse"></div>
        {/* Title skeleton */}
      </div>

      {/* Navigation Skeleton */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-2 px-4">
          {/* Navigation items skeleton */}
          {[...Array(6)].map((_, index) => (
            <li key={index}>
              <div className="flex items-center gap-3 px-auto py-3 rounded-lg">
                <div className="h-4 min-w-[30px] bg-gray-200 rounded animate-pulse"></div>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button Skeleton */}
      <footer className="px-4 py-8">
        <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f1f5f9] rounded-lg shadow">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </footer>
    </aside>
  );
}
