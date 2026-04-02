export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-5 w-52 bg-slate-200 rounded animate-pulse mb-5" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
