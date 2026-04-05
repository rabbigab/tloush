export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
      {/* Title skeleton */}
      <div>
        <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 h-24 animate-pulse"
          />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="h-5 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
        <div className="flex items-end gap-2 h-40">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t animate-pulse"
              style={{ height: `${30 + ((i * 17) % 60)}%` }}
            />
          ))}
        </div>
      </div>

      {/* List skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
