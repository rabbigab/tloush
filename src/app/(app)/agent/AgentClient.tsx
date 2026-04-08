'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Play, Square, ChevronLeft, Eye, Zap, Shield, Clock, Loader2, CheckCircle2, AlertTriangle, Monitor } from 'lucide-react'
import { WORKFLOWS } from '@/lib/computerUse/workflows'
import type { AgentWorkflow, AgentEvent } from '@/lib/computerUse/types'

type ViewState = 'list' | 'setup' | 'running' | 'done'

export default function AgentClient() {
  const [view, setView] = useState<ViewState>('list')
  const [selectedWorkflow, setSelectedWorkflow] = useState<AgentWorkflow | null>(null)
  const [userInputs, setUserInputs] = useState<Record<string, string>>({})
  const [steps, setSteps] = useState<AgentEvent[]>([])
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const stepsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll steps
  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps])

  const selectWorkflow = (workflow: AgentWorkflow) => {
    setSelectedWorkflow(workflow)
    setUserInputs({})
    setSteps([])
    setCurrentScreenshot(null)
    setError(null)
    setView('setup')
  }

  const startAgent = useCallback(async () => {
    if (!selectedWorkflow) return

    // Validate required fields
    for (const input of selectedWorkflow.requiredInputs) {
      if (input.required && !userInputs[input.id]) {
        setError(`Veuillez remplir : ${input.label_fr}`)
        return
      }
    }

    setView('running')
    setSteps([])
    setCurrentScreenshot(null)
    setError(null)
    setStatus('running')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWorkflow.id,
          userInputs,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur serveur')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Pas de flux de réponse')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event: AgentEvent = JSON.parse(line.slice(6))
            handleEvent(event)
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setStatus('cancelled')
      } else {
        setError((err as Error).message)
        setStatus('error')
      }
    } finally {
      abortRef.current = null
    }
  }, [selectedWorkflow, userInputs])

  const handleEvent = (event: AgentEvent) => {
    setSteps(prev => [...prev, event])

    switch (event.type) {
      case 'screenshot':
        setCurrentScreenshot(event.data)
        break
      case 'status':
        setStatus(event.status)
        if (event.status === 'completed') setView('done')
        break
      case 'error':
        setError(event.message)
        break
      case 'done':
        if (status !== 'error') setView('done')
        break
    }
  }

  const stopAgent = () => {
    abortRef.current?.abort()
    setStatus('cancelled')
    setView('done')
  }

  const reset = () => {
    setView('list')
    setSelectedWorkflow(null)
    setUserInputs({})
    setSteps([])
    setCurrentScreenshot(null)
    setError(null)
    setStatus('idle')
  }

  // Categories for the workflow list
  const categories = [
    { id: 'utilities' as const, name: 'Factures & Services', icon: '⚡' },
    { id: 'government' as const, name: 'Gouvernement & Administration', icon: '🏛️' },
    { id: 'health' as const, name: 'Santé', icon: '🏥' },
    { id: 'housing' as const, name: 'Logement', icon: '🏠' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {view !== 'list' && (
            <button
              onClick={view === 'running' ? stopAgent : reset}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Agent Tloush</h1>
          </div>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
            Beta
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          L&apos;IA navigue sur les sites israéliens pour vous. Vous voyez tout en temps réel.
        </p>
      </div>

      {/* Workflow List */}
      {view === 'list' && (
        <div className="space-y-8">
          {/* How it works */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-100 dark:border-blue-900">
            <h2 className="font-semibold mb-4 text-blue-900 dark:text-blue-100">Comment ca marche ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                  <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">1. Choisissez une tâche</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sélectionnez le service que vous voulez utiliser</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">2. L&apos;IA navigue pour vous</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Claude lit l&apos;hébreu et remplit les formulaires</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">3. Vous validez</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Rien n&apos;est soumis sans votre accord</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflows by category */}
          {categories.map(cat => {
            const workflows = WORKFLOWS.filter(w => w.category === cat.id)
            if (workflows.length === 0) return null
            return (
              <div key={cat.id}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {workflows.map(workflow => (
                    <button
                      key={workflow.id}
                      onClick={() => selectWorkflow(workflow)}
                      className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{workflow.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{workflow.name_fr}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{workflow.description_fr}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{workflow.estimatedMinutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {workflow.estimatedCost}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Setup Form */}
      {view === 'setup' && selectedWorkflow && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedWorkflow.icon}</span>
              <div>
                <h2 className="text-lg font-semibold">{selectedWorkflow.name_fr}</h2>
                <p className="text-sm text-gray-500">{selectedWorkflow.description_fr}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {selectedWorkflow.requiredInputs.map(input => (
                <div key={input.id}>
                  <label className="block text-sm font-medium mb-1">
                    {input.label_fr}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                    <span className="text-gray-400 text-xs ml-2 font-normal">({input.label_he})</span>
                  </label>

                  {input.type === 'select' ? (
                    <select
                      value={userInputs[input.id] || ''}
                      onChange={e => setUserInputs(prev => ({ ...prev, [input.id]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisir...</option>
                      {input.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label_fr}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={input.sensitive ? 'password' : input.type === 'date' ? 'date' : 'text'}
                      placeholder={input.placeholder}
                      value={userInputs[input.id] || ''}
                      onChange={e => setUserInputs(prev => ({ ...prev, [input.id]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400 mb-4">
              <Shield className="w-5 h-5 shrink-0" />
              <p>Vos données sont utilisées uniquement pour cette tâche et ne sont pas stockées.</p>
            </div>

            <button
              onClick={startAgent}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4" />
              Lancer l&apos;agent
            </button>
          </div>
        </div>
      )}

      {/* Running / Done View */}
      {(view === 'running' || view === 'done') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Screenshot panel */}
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm text-gray-300 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Ecran du navigateur
              </span>
              {view === 'running' && (
                <button
                  onClick={stopAgent}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg flex items-center gap-1 transition"
                >
                  <Square className="w-3 h-3" />
                  Arrêter
                </button>
              )}
            </div>
            <div className="aspect-video bg-gray-950 flex items-center justify-center">
              {currentScreenshot ? (
                <img
                  src={`data:image/png;base64,${currentScreenshot}`}
                  alt="Capture d'écran du navigateur"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-500 text-sm flex flex-col items-center gap-2">
                  {status === 'running' ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span>Chargement de la page...</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-8 h-8" />
                      <span>En attente de la capture</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Steps panel */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[600px]">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="font-medium flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                Activité de l&apos;agent
              </span>
              <StatusBadge status={status} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {steps.filter(s => s.type !== 'screenshot' && s.type !== 'status' && s.type !== 'done').map((step, i) => (
                <StepItem key={i} event={step} />
              ))}
              {steps.length === 0 && status === 'running' && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Démarrage de l&apos;agent...
                </div>
              )}
              <div ref={stepsEndRef} />
            </div>

            {view === 'done' && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={reset}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Nouvelle tâche
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    idle: { color: 'bg-gray-100 text-gray-600', label: 'En attente' },
    running: { color: 'bg-blue-100 text-blue-700', label: 'En cours...' },
    completed: { color: 'bg-green-100 text-green-700', label: 'Terminé' },
    error: { color: 'bg-red-100 text-red-700', label: 'Erreur' },
    cancelled: { color: 'bg-gray-100 text-gray-600', label: 'Annulé' },
  }[status] || { color: 'bg-gray-100 text-gray-600', label: status }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

function StepItem({ event }: { event: AgentEvent }) {
  switch (event.type) {
    case 'thinking':
      return (
        <div className="flex items-start gap-2 text-sm">
          <Bot className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-gray-600 dark:text-gray-400 italic">{event.text}</p>
        </div>
      )
    case 'action':
      return (
        <div className="flex items-start gap-2 text-sm">
          <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
        </div>
      )
    case 'confirmation':
      return (
        <div className="flex items-start gap-2 text-sm p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-amber-700 dark:text-amber-400">{event.prompt}</p>
        </div>
      )
    case 'result':
      return (
        <div className="flex items-start gap-2 text-sm p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-700 dark:text-green-400 whitespace-pre-wrap">{event.text}</p>
        </div>
      )
    case 'error':
      return (
        <div className="flex items-start gap-2 text-sm p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-red-700 dark:text-red-400">{event.message}</p>
        </div>
      )
    default:
      return null
  }
}
