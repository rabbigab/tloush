export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
      </div>
    </div>
  )
}
