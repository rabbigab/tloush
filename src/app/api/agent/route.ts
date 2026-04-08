/**
 * POST /api/agent — Start a Computer Use agent session
 *
 * Streams SSE events as Claude navigates an Israeli website.
 * Each event includes screenshots, actions, and Claude's reasoning.
 *
 * Body: { workflowId: string, userInputs: Record<string, string> }
 * Response: SSE stream of AgentEvent objects
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { ComputerUseAgent } from '@/lib/computerUse/agent'
import { getWorkflow, resolveStartUrl } from '@/lib/computerUse/workflows'
import type { AgentStep } from '@/lib/computerUse/types'

export const maxDuration = 300 // 5 minutes max for Vercel Pro
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* read-only in route handlers */ },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 })
  }

  // Parse request
  const body = await request.json()
  const { workflowId, userInputs } = body as {
    workflowId: string
    userInputs: Record<string, string>
  }

  if (!workflowId || !userInputs) {
    return new Response(JSON.stringify({ error: 'workflowId et userInputs requis' }), { status: 400 })
  }

  const workflow = getWorkflow(workflowId)
  if (!workflow) {
    return new Response(JSON.stringify({ error: `Workflow "${workflowId}" non trouvé` }), { status: 404 })
  }

  // Validate required inputs
  for (const input of workflow.requiredInputs) {
    if (input.required && !userInputs[input.id]) {
      return new Response(
        JSON.stringify({ error: `Champ requis manquant : ${input.label_fr}` }),
        { status: 400 }
      )
    }
  }

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY non configurée' }), { status: 500 })
  }

  // Resolve the start URL based on user inputs
  const resolvedWorkflow = { ...workflow, startUrl: resolveStartUrl(workflow, userInputs) }

  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Stream might be closed
        }
      }

      const agent = new ComputerUseAgent(apiKey)

      try {
        sendEvent({ type: 'status', status: 'running' })

        await agent.run(
          resolvedWorkflow,
          userInputs,
          // onStep callback — stream each step to the client
          async (step: AgentStep) => {
            if (step.screenshot) {
              // Send screenshot separately (can be large)
              sendEvent({
                type: 'screenshot',
                data: step.screenshot,
                stepIndex: parseInt(step.id.split('-')[1]) || 0,
              })
            }
            if (step.thinking) {
              sendEvent({ type: 'thinking', text: step.thinking })
            }
            if (step.action) {
              sendEvent({ type: 'action', description: step.action })
            }
            if (step.confirmationPrompt) {
              sendEvent({
                type: 'confirmation',
                prompt: step.confirmationPrompt,
                stepIndex: parseInt(step.id.split('-')[1]) || 0,
              })
            }
            if (step.result) {
              sendEvent({ type: 'result', text: step.result })
            }
            if (step.error) {
              sendEvent({ type: 'error', message: step.error })
            }
          },
          // onConfirm callback — for MVP, auto-confirm non-payment actions
          // In production, this would pause and wait for user input via WebSocket
          async (prompt: string) => {
            sendEvent({
              type: 'confirmation',
              prompt,
              stepIndex: 0,
            })
            // For MVP: auto-confirm read-only actions, reject payment actions
            const isPayment = /paie|pay|submit|soumett/i.test(prompt)
            return !isPayment
          },
        )

        sendEvent({ type: 'status', status: 'completed' })
        sendEvent({ type: 'done' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        sendEvent({ type: 'error', message })
        sendEvent({ type: 'status', status: 'error' })
        sendEvent({ type: 'done' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
