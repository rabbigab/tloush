/**
 * Types for the Computer Use agent (Claude + Playwright)
 * Used to automate Israeli service websites on behalf of users
 */

export type AgentStatus = 'idle' | 'running' | 'waiting_confirmation' | 'completed' | 'error'

export interface AgentStep {
  id: string
  timestamp: number
  type: 'screenshot' | 'action' | 'thinking' | 'confirmation' | 'result' | 'error'
  screenshot?: string        // base64 PNG
  action?: string            // Human-readable description of action taken
  thinking?: string          // Claude's reasoning text
  confirmationPrompt?: string // Question for user before sensitive action
  result?: string            // Final result text
  error?: string
}

export interface AgentSession {
  id: string
  userId: string
  workflowId: string
  status: AgentStatus
  steps: AgentStep[]
  startedAt: number
  completedAt?: number
  userInputs: Record<string, string>  // Data the user provided for the workflow
}

export interface AgentWorkflow {
  id: string
  name_fr: string
  name_he: string
  description_fr: string
  icon: string
  category: 'utilities' | 'government' | 'banking' | 'health' | 'housing'
  estimatedMinutes: number
  estimatedCost: string      // e.g. "~2-4₪"
  requiredInputs: WorkflowInput[]
  startUrl: string
  systemPrompt: string
  confirmBeforeSubmit: boolean  // Always ask user before final submission
}

export interface WorkflowInput {
  id: string
  label_fr: string
  label_he: string
  type: 'text' | 'number' | 'date' | 'select' | 'password'
  placeholder?: string
  required: boolean
  sensitive?: boolean  // Will be masked in UI
  options?: { value: string; label_fr: string }[]  // For select type
}

// SSE event types streamed to the client
export type AgentEvent =
  | { type: 'status'; status: AgentStatus }
  | { type: 'screenshot'; data: string; stepIndex: number }
  | { type: 'thinking'; text: string }
  | { type: 'action'; description: string }
  | { type: 'confirmation'; prompt: string; stepIndex: number }
  | { type: 'result'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done' }
