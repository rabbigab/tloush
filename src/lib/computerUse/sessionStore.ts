/**
 * In-memory store for pending agent user input requests.
 * Bridges the SSE stream (agent route) with the respond endpoint.
 *
 * In production, replace with Redis for multi-instance support.
 */

import type { UserInputResponse } from './types'

interface PendingInput {
  resolve: (response: UserInputResponse) => void
  timeout: ReturnType<typeof setTimeout>
}

const pendingInputs = new Map<string, PendingInput>()

/**
 * Register a pending user input request.
 * Returns a promise that resolves when the user responds.
 */
export function waitForUserInput(requestId: string, timeoutMs = 5 * 60 * 1000): Promise<UserInputResponse> {
  return new Promise<UserInputResponse>((resolve) => {
    const timeout = setTimeout(() => {
      pendingInputs.delete(requestId)
      resolve({ requestId, value: '', cancelled: true })
    }, timeoutMs)

    pendingInputs.set(requestId, { resolve, timeout })
  })
}

/**
 * Resolve a pending user input request with the user's response.
 */
export function resolveUserInput(requestId: string, response: UserInputResponse): boolean {
  const pending = pendingInputs.get(requestId)
  if (!pending) return false
  clearTimeout(pending.timeout)
  pendingInputs.delete(requestId)
  pending.resolve(response)
  return true
}
