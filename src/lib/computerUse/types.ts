/**
 * Types for the Computer Use agent (Claude + Playwright)
 * Hybrid model: agent navigates, user assists with auth/CAPTCHA/SMS
 */

export type AgentStatus = 'idle' | 'running' | 'waiting_user_input' | 'completed' | 'error'

export interface AgentStep {
  id: string
  timestamp: number
  type: 'screenshot' | 'action' | 'thinking' | 'user_input_needed' | 'result' | 'error'
  screenshot?: string        // base64 PNG
  action?: string            // Human-readable description of action taken
  thinking?: string          // Claude's reasoning text
  result?: string            // Final result text
  error?: string
  userInputRequest?: UserInputRequest  // When agent needs user help
}

/**
 * When the agent encounters something it can't handle alone
 * (CAPTCHA, password, SMS code, confirmation), it pauses
 * and asks the user via this structure.
 */
export interface UserInputRequest {
  requestId: string
  inputType: 'captcha' | 'password' | 'sms_code' | 'text_input' | 'confirmation' | 'select'
  label_fr: string           // "Entrez le code SMS reçu"
  screenshot?: string        // Current screenshot showing what needs to be solved
  placeholder?: string
  sensitive?: boolean        // Mask input (passwords)
  options?: { value: string; label: string }[]  // For select type
}

export interface UserInputResponse {
  requestId: string
  value: string              // User's input (CAPTCHA solution, password, SMS code)
  cancelled?: boolean        // User wants to abort
}

export interface AgentSession {
  id: string
  userId: string
  workflowId: string
  status: AgentStatus
  steps: AgentStep[]
  startedAt: number
  completedAt?: number
  userInputs: Record<string, string>
}

export interface AgentWorkflow {
  id: string
  name_fr: string
  name_he: string
  description_fr: string
  icon: string
  category: 'utilities' | 'government' | 'banking' | 'health' | 'housing'
  estimatedMinutes: number
  estimatedCost: string
  requiredInputs: WorkflowInput[]
  startUrl: string
  systemPrompt: string
}

export interface WorkflowInput {
  id: string
  label_fr: string
  label_he: string
  type: 'text' | 'number' | 'date' | 'select' | 'password'
  placeholder?: string
  required: boolean
  sensitive?: boolean
  options?: { value: string; label_fr: string }[]
  helpText?: string          // "Vous trouverez ce numéro sur votre facture..."
  helpImage?: string         // Path to helper image showing where to find the info
  allowSkip?: boolean        // Show "Je ne sais pas" — agent will try without it
}

// SSE event types streamed to the client
export type AgentEvent =
  | { type: 'status'; status: AgentStatus }
  | { type: 'screenshot'; data: string; stepIndex: number }
  | { type: 'thinking'; text: string }
  | { type: 'action'; description: string }
  | { type: 'user_input_needed'; request: UserInputRequest }
  | { type: 'result'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done' }
