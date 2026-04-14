export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="space-y-1">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
    </div>
  )
}
