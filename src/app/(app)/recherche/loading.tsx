export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4 w-full">
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
