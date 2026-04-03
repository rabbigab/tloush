'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, FileText, Loader2, User, Bot } from 'lucide-react'
import Link from 'next/link'
import { track } from '@/lib/analytics'
import { DOC_LABELS } from '@/lib/docTypes'
import type { AppDocument } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  'Est-ce que ce document est important ?',
  'Que dois-je faire maintenant ?',
  'Est-ce qu\'il y a une anomalie ?',
  'Expliquez-moi ce document en detail',
  'Quel est le délai pour répondre ?',
  'Traduire un message en hébreu',
]


export default function AssistantClient({
  currentDocument,
  allDocuments,
  userEmail
}: {
  currentDocument: AppDocument | null
  allDocuments: AppDocument[]
  userEmail: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [activeDoc, setActiveDoc] = useState<AppDocument | null>(currentDocument)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeDoc) {
      setMessages([{
        role: 'assistant',
        content: `Bonjour ! J'ai charge votre document **${activeDoc.file_name}**${activeDoc.period ? ` (${activeDoc.period})` : ''}.\n\n${activeDoc.summary_fr || ''}\n\nQue voulez-vous savoir sur ce document ?`
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
          : 'Une erreur est survenue. Réessayez dans quelques instants.'
        throw new Error(errorMsg)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      if (data.conversationId) setConversationId(data.conversationId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Désolé, une erreur est survenue. Réessayez dans quelques instants.'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${errorMessage}`
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function selectDocument(doc: AppDocument) {
    setActiveDoc(doc)
    setConversationId(null)
    router.push(`/assistant?doc=${doc.id}`)
  }

  function renderMessage(content: string) {
    // Escape HTML first to prevent XSS
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return escaped
      // Code blocks (```)
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 rounded-xl p-3 my-2 text-xs overflow-x-auto"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers (## and ###)
      .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-sm mt-3 mb-1">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="my-1 space-y-0.5">${match}</ul>`)
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g, (match) => `<ol class="my-1 space-y-0.5">${match}</ol>`)
      // Line breaks
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 flex gap-4">

        {/* Sidebar documents */}
        <div className="w-64 shrink-0 hidden md:block">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sticky top-20 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 px-1">Vos documents</p>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveDoc(null); setConversationId(null); router.push('/assistant') }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors min-h-[40px] ${!activeDoc ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                Question générale
              </button>
              {allDocuments.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => selectDocument(doc)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors min-h-[40px] ${activeDoc?.id === doc.id ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <div className="flex items-start gap-2">
                    <FileText size={14} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-xs">{doc.file_name}</p>
                      {doc.period && <p className="text-xs text-slate-400 dark:text-slate-500">{doc.period}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">

          {/* Document actif */}
          {activeDoc && (
            <div className="px-4 py-3 bg-brand-50 dark:bg-brand-950/30 border-b border-brand-100 dark:border-brand-900 flex items-center gap-2">
              <FileText size={15} className="text-brand-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-medium text-brand-800 dark:text-brand-200 truncate block">{activeDoc.file_name}</span>
                <span className="text-xs text-brand-600 dark:text-brand-400">{DOC_LABELS[activeDoc.document_type] || 'Document'}{activeDoc.period ? ` · ${activeDoc.period}` : ''}</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={14} className="text-brand-600 dark:text-brand-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                />
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0 mt-1">
                    <User size={14} className="text-slate-600 dark:text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-brand-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Tloush reflechit...</span>
                </div>
              </div>
            )}

            {/* Questions suggerees */}
            {messages.length <= 1 && !loading && (
              <div className="pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Questions fréquentes :</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-white dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-700 rounded-xl px-3 py-2 text-slate-600 dark:text-slate-300 transition-colors min-h-[36px]"
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
          <div className="border-t border-slate-200 dark:border-slate-700 p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                aria-label="Votre message"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent max-h-32"
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
                className="w-11 h-11 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0 active:scale-95"
                aria-label="Envoyer le message"
              >
                {loading ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">Entrée pour envoyer · Maj+Entrée pour sauter une ligne</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">Tloush n&apos;est ni un avocat ni un comptable. Consultez un expert pour un avis professionnel.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
