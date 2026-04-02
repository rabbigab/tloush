export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
            <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-50 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
