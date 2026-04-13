export default function BenefitsCatalogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
