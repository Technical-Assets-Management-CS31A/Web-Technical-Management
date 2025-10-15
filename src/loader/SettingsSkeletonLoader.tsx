export default function SettingsSkeletonLoader() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="px-6 md:px-10 py-10 w-full mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="h-8 bg-slate-200 rounded w-56 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-80 animate-pulse"></div>
        </div>

        <div className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/60 animate-pulse ring-2 ring-white/40 shadow-md"></div>
                  <span className="absolute -bottom-5 -right-15 inline-flex items-center px-6 py-2 rounded-full text-[10px] font-semibold bg-white/20 text-transparent ring-1 ring-white/40 animate-pulse"></span>
                </div>
                <div>
                  <div className="h-7 bg-white/60 rounded w-56 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-white/40 rounded w-40 animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-32 rounded-lg bg-white/80 ring-1 ring-white/60 animate-pulse"></div>
                <div className="h-9 w-40 rounded-lg bg-blue-500/70 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5 rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="h-5 bg-slate-200 rounded w-44 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-28 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="h-5 bg-slate-200 rounded w-44 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-28 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-12 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-10 mb-1 animate-pulse"></div>
                      <div className="h-5 bg-slate-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div>
                  <div className="h-5 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-60 animate-pulse"></div>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-full animate-pulse"></span>
                  <span className="h-4 w-16 bg-slate-200 rounded animate-pulse"></span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                <div className="h-5 bg-slate-200 rounded w-20 animate-pulse"></div>
                <div className="mt-2 h-3 bg-slate-200 rounded w-40 animate-pulse"></div>
                <div className="mt-3">
                  <div className="w-full h-9 rounded-lg bg-slate-900/80 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


