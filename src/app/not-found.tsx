import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Home, Inbox, Search, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Page introuvable — Tloush',
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <div className="text-[120px] sm:text-[160px] font-black leading-none bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-transparent select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search size={48} className="text-blue-500/20 dark:text-blue-400/20" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
            Page introuvable
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Cette page n'existe pas ou a été déplacée. Vérifiez l'URL ou retournez à l'accueil.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 px-5 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Home size={16} />
              Retour à l'accueil
            </Link>
            <Link
              href="/inbox"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Inbox size={16} />
              Mon inbox
            </Link>
          </div>

          <Link
            href="javascript:history.back()"
            className="inline-flex items-center gap-1.5 mt-6 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Page précédente
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}
