'use client'

import { useState, useEffect } from 'react'
import AppHeader from './AppHeader'
import AppNav from './AppNav'
import { createClient } from '@/lib/supabase/client'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState('')

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
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
