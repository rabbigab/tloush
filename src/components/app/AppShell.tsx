'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import AppHeader from './AppHeader'
import AppNav from './AppNav'
import { createClient } from '@/lib/supabase/client'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || '')
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader userEmail={userEmail} />
      <AppNav />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-1 pb-24 md:pb-0"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
