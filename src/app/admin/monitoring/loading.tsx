export default function MonitoringLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  )
}
