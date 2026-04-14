import { Loader2 } from 'lucide-react'

export default function ScannerLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="text-brand-600 animate-spin" />
        <p className="text-sm text-neutral-500">Chargement du scanner...</p>
      </div>
    </main>
  )
}
