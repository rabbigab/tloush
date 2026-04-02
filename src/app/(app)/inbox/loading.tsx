export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 w-full">
      {/* Upload zone skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
        <div className="h-24 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
      </div>
      {/* Document cards skeleton */}
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
