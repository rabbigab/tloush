export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:block w-72 bg-white border-r border-slate-200 p-4">
        <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-6" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse mb-2" />
        ))}
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse mx-auto mb-3" />
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </main>
    </div>
  )
}
