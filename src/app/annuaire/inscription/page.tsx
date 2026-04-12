'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Users, Star, Globe, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { PROVIDER_CATEGORIES, PROVIDER_CITIES } from '@/types/directory'
import { track } from '@/lib/analytics'

const STEPS = ['Identité', 'Activité', 'Vérification', 'Confirmation']

function isValidPhone(phone: string): boolean {
  // Accept Israeli formats: 05X, +972, 972, or international
  const cleaned = phone.replace(/[\s\-().]/g, '')
  return /^(\+?972|0)\d{8,9}$/.test(cleaned) || /^\+?\d{8,15}$/.test(cleaned)
}

export default function InscriptionPrestatairePage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [triedNext, setTriedNext] = useState(false)

  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    category: '', specialties: [] as string[], service_areas: [] as string[],
    description: '', years_experience: '',
    osek_number: '', reference_name: '', reference_phone: '',
  })

  function update(field: string, value: string | string[]) {
