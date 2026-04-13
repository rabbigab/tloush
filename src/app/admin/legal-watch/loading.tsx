export default function LegalWatchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-56" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
