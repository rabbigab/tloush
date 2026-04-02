export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mx-auto mb-2" />
              <div className="h-3 w-16 bg-slate-100 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse" />
          <div className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
