export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-3xl p-6 sm:p-8">
        <div className="h-8 w-40 bg-white/20 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-white/10 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/15 rounded-2xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 h-56 animate-pulse" />
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 h-56 animate-pulse" />
      </div>
    </div>
  )
}
