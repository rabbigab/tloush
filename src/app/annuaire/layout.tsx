import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AnnuaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
