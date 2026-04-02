import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl font-extrabold text-slate-200 mb-4">404</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Page introuvable</h1>
          <p className="text-sm text-slate-500 mb-6">
            Cette page n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/inbox"
              className="text-sm font-medium text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Mon inbox
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
