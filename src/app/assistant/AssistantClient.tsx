'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, FileText, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { track } from '@/lib/analytics'

interface Document {
  id: string
  file_name: string
  document_type: string
  period?: string
  summary_fr?: string
  analysis_data?: Record<string, unknown>
  created_at: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  'Est-ce que ce document est important ?',
  'Que dois-je faire maintenant ?',
  'Est-ce qu\'il y a une anomalie ?',
  'Pouvez-vous m\'expliquer ce document en détail ?',
  'Quel est le délai pour répondre ?',
]

const DOC_LABELS: Record<string, string> = {
  payslip: '💰 Fiche de paie',
  official_letter: '📨 Courrier officiel',
  contract: '📋 Contrat',
  tax: '🧾 Fiscal',
  other: '📄 Document',
  unknown: '📄 Document'
}

export default function AssistantClient({
  currentDocument,
  allDocuments,
  userEmail
}: {
  currentDocument: Document | null
  allDocuments: Document[]
  userEmail: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [activeDoc, setActiveDoc] = useState<Document | null>(currentDocument)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Message d'accueil
  useEffect(() => {
    if (activeDoc) {
      setMessages([{
        role: 'assistant',
        content: `Bonjour ! J'ai chargé votre document **${activeDoc.file_name}**${activeDoc.period ? ` (${activeDoc.period})` : ''}.\n\n${activeDoc.summary_fr || ''}\n\nQue voulez-vous savoir sur ce document ?`
      }])
    } else {
      setMessages([{
        role: 'assistant',
        content: 'Bonjour ! Je suis votre assistant Tloush. Je peux répondre à vos questions sur vos documents administratifs israéliens ou sur l\'administration en Israël en général.\n\nSélectionnez un document ci-dessous ou posez-moi directement votre question.'
      }])
    }
  }, [activeDoc])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMessage = text.trim()
    const isFirstMessage = messages.filter(m => m.role === 'user').length === 0
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    if (isFirstMessage) {
      track('page_viewed', { page: 'assistant', has_document: !!activeDoc })
    }

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          documentId: activeDoc?.id || null,
          conversationId
        })
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = res.status === 429
          ? 'Vous avez atteint la limite de messages (30/heure). Réessayez dans quelques minutes.'
          : data.error || 'Une erreur est survenue.'
        throw new Error(errorMsg)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      if (data.conversationId) setConversationId(data.conversationId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Désolé, une erreur est survenue. Réessayez dans quelques instants.'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errorMessage}`
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function selectDocument(doc: Document) {
    setActiveDoc(doc)
    setConversationId(null)
    router.push(`/assistant?doc=${doc.id}`)
  }

  function renderMessage(content: string) {
    // Rendu simple avec support markdown basique
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/inbox" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-xl font-extrabold text-blue-600">Tloush</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500 font-medium">Assistant</span>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 flex gap-4">

        {/* Sidebar documents */}
        <div className="w-64 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sticky top-20">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 px-1">Vos documents</p>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveDoc(null); setConversationId(null); router.push('/assistant') }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!activeDoc ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Question générale
              </button>
              {allDocuments.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => selectDocument(doc)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${activeDoc?.id === doc.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-start gap-2">
                    <FileText size={13} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-xs">{doc.file_name}</p>
                      {doc.period && <p className="text-xs text-slate-400">{doc.period}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">

          {/* Document actif */}
          {activeDoc && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <FileText size={15} className="text-blue-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-medium text-blue-800 truncate block">{activeDoc.file_name}</span>
                <span className="text-xs text-blue-500">{DOC_LABELS[activeDoc.document_type] || 'Document'}{activeDoc.period ? ` · ${activeDoc.period}` : ''}</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">Tloush réfléchit...</span>
                </div>
              </div>
            )}

            {/* Questions suggérées */}
            {messages.length <= 1 && !loading && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-2">Questions fréquentes :</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl px-3 py-1.5 text-slate-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                style={{ height: 'auto' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={16} className={input.trim() && !loading ? 'text-white' : 'text-slate-400'} />
              </button>
            </div>
            <p className="text-xs text-slate-300 text-center mt-2">Entrée pour envoyer · Maj+Entrée pour sauter une ligne</p>
            <p className="text-[10px] text-slate-300 text-center mt-1">Tloush n'est ni un avocat ni un comptable. Pour un avis professionnel, consultez un expert.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
