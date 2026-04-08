/**
 * Computer Use Agent — Hybrid Model
 *
 * Claude navigates Israeli websites via Playwright.
 * When it encounters auth, CAPTCHAs, or SMS codes, it PAUSES
 * and asks the user for help. The user sees the screenshot,
 * provides the input, and the agent continues.
 *
 * Flow:
 *   Agent navigates → hits login → PAUSE → user enters password
 *   → agent continues → hits CAPTCHA → PAUSE → user solves it
 *   → agent continues → hits SMS → PAUSE → user enters code
 *   → agent completes the task → DONE
 */

import Anthropic from '@anthropic-ai/sdk'
import { chromium, type Browser, type Page } from 'playwright'
import type { AgentStep, AgentWorkflow, UserInputRequest, UserInputResponse } from './types'

const DISPLAY_WIDTH = 1280
const DISPLAY_HEIGHT = 800
const MAX_ITERATIONS = 40

interface ComputerAction {
  action: string
  coordinate?: [number, number]
  text?: string
  scroll_direction?: 'up' | 'down' | 'left' | 'right'
  scroll_amount?: number
  target_coordinate?: [number, number]
}

type StepCallback = (step: AgentStep) => void | Promise<void>
type UserInputCallback = (request: UserInputRequest) => Promise<UserInputResponse>

export class ComputerUseAgent {
  private client: Anthropic
  private browser: Browser | null = null
  private page: Page | null = null
  private stepCounter = 0

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  /**
   * Run a workflow with user assistance for auth/CAPTCHA/SMS.
   */
  async run(
    workflow: AgentWorkflow,
    userInputs: Record<string, string>,
    onStep: StepCallback,
    onUserInput: UserInputCallback,
  ): Promise<string> {
    try {
      // Launch stealth browser
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          `--window-size=${DISPLAY_WIDTH},${DISPLAY_HEIGHT}`,
        ],
      })

      const context = await this.browser.newContext({
        viewport: { width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT },
        locale: 'he-IL',
        timezoneId: 'Asia/Jerusalem',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      })
      this.page = await context.newPage()

      // Hide automation indicators (stealth without external plugin)
      await this.page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false })
        // Hide chrome automation properties
        Object.defineProperty(navigator, 'languages', { get: () => ['he-IL', 'he', 'en-US', 'en'] })
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
        // Prevent iframe detection
        const originalQuery = window.navigator.permissions.query
        window.navigator.permissions.query = (parameters: PermissionDescriptor) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
            : originalQuery(parameters)
      })

      // Navigate to start URL
      await this.emitStep(onStep, {
        type: 'action',
        action: `Navigation vers ${workflow.startUrl}`,
      })
      await this.page.goto(workflow.startUrl, { waitUntil: 'networkidle', timeout: 30000 })

      // Take initial screenshot
      const initialScreenshot = await this.takeScreenshot()
      await this.emitStep(onStep, { type: 'screenshot', screenshot: initialScreenshot })

      // System prompt that tells Claude to ASK for user help
      const systemPrompt = this.buildSystemPrompt(workflow, userInputs)

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: initialScreenshot } },
            {
              type: 'text',
              text: `Voici la page d'accueil. Commence la tâche : ${workflow.description_fr}\n\nDonnées de l'utilisateur :\n${Object.entries(userInputs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`,
            },
          ],
        },
      ]

      let iteration = 0
      let finalResult = ''

      while (iteration < MAX_ITERATIONS) {
        iteration++

        const response = await this.client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: systemPrompt,
          messages,
          tools: [
            {
              type: 'computer_20251124' as never,
              name: 'computer',
              display_width_px: DISPLAY_WIDTH,
              display_height_px: DISPLAY_HEIGHT,
            } as never,
          ],
          betas: ['computer-use-2025-11-24'] as never,
        } as never)

        messages.push({ role: 'assistant', content: response.content })

        const toolUseBlocks = response.content.filter(
          (block: { type: string }) => block.type === 'tool_use'
        ) as Array<{ type: 'tool_use'; id: string; name: string; input: ComputerAction }>

        const textBlocks = response.content.filter(
          (block: { type: string }) => block.type === 'text'
        ) as Array<{ type: 'text'; text: string }>

        // Emit Claude's thinking
        for (const block of textBlocks) {
          if (block.text.trim()) {
            await this.emitStep(onStep, { type: 'thinking', thinking: block.text })

            // Check if Claude is asking for user input
            const userInputNeeded = this.detectUserInputRequest(block.text)
            if (userInputNeeded) {
              const screenshot = await this.takeScreenshot()
              userInputNeeded.screenshot = screenshot
              await this.emitStep(onStep, { type: 'screenshot', screenshot })

              // Pause and wait for user
              const userResponse = await onUserInput(userInputNeeded)

              if (userResponse.cancelled) {
                finalResult = 'Tâche annulée par l\'utilisateur.'
                break
              }

              // Type the user's input into the active field
              if (userResponse.value && this.page) {
                await this.page.keyboard.type(userResponse.value, { delay: 80 })
                await this.emitStep(onStep, {
                  type: 'action',
                  action: `Saisie ${userInputNeeded.sensitive ? '(masquée)' : ''}: ${userInputNeeded.label_fr}`,
                })

                // Take screenshot after typing and feed back to Claude
                await this.page.waitForTimeout(500)
                const afterScreenshot = await this.takeScreenshot()
                await this.emitStep(onStep, { type: 'screenshot', screenshot: afterScreenshot })

                // Add the user's action as context for Claude
                messages.push({
                  role: 'user',
                  content: [
                    { type: 'text', text: `L'utilisateur a saisi ${userInputNeeded.label_fr}. Voici l'écran actuel :` },
                    { type: 'image', source: { type: 'base64', media_type: 'image/png', data: afterScreenshot } },
                  ],
                })
                continue // Go back to Claude for next action
              }
            }
          }
        }

        // If no tool calls, Claude is done
        if (toolUseBlocks.length === 0) {
          finalResult = textBlocks.map(b => b.text).join('\n')
          break
        }

        // Execute each tool call
        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

        for (const toolUse of toolUseBlocks) {
          const action = toolUse.input

          try {
            await this.executeAction(action)

            await this.emitStep(onStep, {
              type: 'action',
              action: this.describeAction(action),
            })

            // After any action, take screenshot for Claude
            if (action.action !== 'screenshot') {
              await this.page!.waitForTimeout(800)
            }
            const screenshot = await this.takeScreenshot()
            await this.emitStep(onStep, { type: 'screenshot', screenshot })

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: [
                { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshot } },
              ],
            })
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error)
            await this.emitStep(onStep, { type: 'error', error: errorMsg })
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Erreur : ${errorMsg}`,
              is_error: true,
            })
          }
        }

        messages.push({ role: 'user', content: toolResults })

        if (response.stop_reason === 'end_turn' && toolUseBlocks.length === 0) {
          finalResult = textBlocks.map(b => b.text).join('\n')
          break
        }
      }

      if (iteration >= MAX_ITERATIONS) {
        finalResult = 'Nombre maximum d\'itérations atteint.'
      }

      await this.emitStep(onStep, { type: 'result', result: finalResult })
      return finalResult
    } finally {
      await this.cleanup()
    }
  }

  /**
   * Detect if Claude's text response is asking for user input.
   * Claude is instructed to use specific markers like [CAPTCHA], [MOT_DE_PASSE], [CODE_SMS].
   */
  private detectUserInputRequest(text: string): UserInputRequest | null {
    const lower = text.toLowerCase()

    if (lower.includes('[captcha]') || lower.includes('captcha')) {
      if (lower.includes('captcha') && (lower.includes('résou') || lower.includes('entrez') || lower.includes('besoin'))) {
        return {
          requestId: `req-${Date.now()}`,
          inputType: 'captcha',
          label_fr: 'Résolvez le CAPTCHA affiché à l\'écran',
          placeholder: 'Entrez le texte du CAPTCHA',
          sensitive: false,
        }
      }
    }

    if (lower.includes('[mot_de_passe]') || (lower.includes('mot de passe') && lower.includes('l\'utilisateur'))) {
      return {
        requestId: `req-${Date.now()}`,
        inputType: 'password',
        label_fr: 'Entrez votre mot de passe',
        placeholder: 'Mot de passe',
        sensitive: true,
      }
    }

    if (lower.includes('[code_sms]') || (lower.includes('code') && lower.includes('sms'))) {
      if (lower.includes('sms') && (lower.includes('entrez') || lower.includes('reçu') || lower.includes('besoin') || lower.includes('l\'utilisateur'))) {
        return {
          requestId: `req-${Date.now()}`,
          inputType: 'sms_code',
          label_fr: 'Entrez le code SMS reçu sur votre téléphone',
          placeholder: 'Code à 6 chiffres',
          sensitive: false,
        }
      }
    }

    if (lower.includes('[saisie_utilisateur]')) {
      return {
        requestId: `req-${Date.now()}`,
        inputType: 'text_input',
        label_fr: 'Saisie requise (voir l\'écran)',
        placeholder: 'Votre réponse',
        sensitive: false,
      }
    }

    if (lower.includes('[confirmation]')) {
      return {
        requestId: `req-${Date.now()}`,
        inputType: 'confirmation',
        label_fr: 'Confirmez-vous cette action ? (voir l\'écran)',
        sensitive: false,
      }
    }

    return null
  }

  private async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('No page available')
    const buffer = await this.page.screenshot({ type: 'png', fullPage: false })
    return buffer.toString('base64')
  }

  private async executeAction(action: ComputerAction): Promise<void> {
    if (!this.page) throw new Error('No page available')

    switch (action.action) {
      case 'screenshot':
        break // Just triggers a screenshot in the caller

      case 'left_click': {
        if (!action.coordinate) throw new Error('Missing coordinate')
        const [x, y] = action.coordinate
        await this.page.mouse.click(x, y)
        break
      }

      case 'right_click': {
        if (!action.coordinate) throw new Error('Missing coordinate')
        const [x, y] = action.coordinate
        await this.page.mouse.click(x, y, { button: 'right' })
        break
      }

      case 'double_click': {
        if (!action.coordinate) throw new Error('Missing coordinate')
        const [x, y] = action.coordinate
        await this.page.mouse.dblclick(x, y)
        break
      }

      case 'type': {
        if (!action.text) throw new Error('Missing text')
        await this.page.keyboard.type(action.text, { delay: 60 })
        break
      }

      case 'key': {
        if (!action.text) throw new Error('Missing key')
        const key = action.text
          .replace(/ctrl/gi, 'Control')
          .replace(/alt/gi, 'Alt')
          .replace(/shift/gi, 'Shift')
          .replace(/enter/gi, 'Enter')
          .replace(/tab/gi, 'Tab')
          .replace(/escape/gi, 'Escape')
          .replace(/backspace/gi, 'Backspace')
          .replace(/delete/gi, 'Delete')
          .replace(/space/gi, ' ')
          .replace(/Return/gi, 'Enter')
        await this.page.keyboard.press(key)
        break
      }

      case 'mouse_move': {
        if (!action.coordinate) throw new Error('Missing coordinate')
        const [x, y] = action.coordinate
        await this.page.mouse.move(x, y)
        break
      }

      case 'scroll': {
        const [x, y] = action.coordinate || [DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2]
        const amount = (action.scroll_amount || 3) * 100
        const dir = action.scroll_direction || 'down'
        await this.page.mouse.move(x, y)
        const deltaX = dir === 'left' ? -amount : dir === 'right' ? amount : 0
        const deltaY = dir === 'up' ? -amount : dir === 'down' ? amount : 0
        await this.page.mouse.wheel(deltaX, deltaY)
        break
      }

      case 'left_click_drag': {
        if (!action.coordinate || !action.target_coordinate) throw new Error('Missing coordinates')
        const [sx, sy] = action.coordinate
        const [tx, ty] = action.target_coordinate
        await this.page.mouse.move(sx, sy)
        await this.page.mouse.down()
        await this.page.mouse.move(tx, ty)
        await this.page.mouse.up()
        break
      }

      case 'wait':
        await this.page.waitForTimeout(1500)
        break

      default:
        throw new Error(`Action inconnue : ${action.action}`)
    }
  }

  private describeAction(action: ComputerAction): string {
    switch (action.action) {
      case 'screenshot': return 'Capture d\'écran'
      case 'left_click': return `Clic sur (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'right_click': return `Clic droit sur (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'double_click': return `Double clic sur (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'type': return `Saisie : "${action.text?.substring(0, 30)}${(action.text?.length || 0) > 30 ? '...' : ''}"`
      case 'key': return `Touche : ${action.text}`
      case 'scroll': return `Défilement ${action.scroll_direction || 'bas'}`
      case 'mouse_move': return `Souris vers (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'wait': return 'Attente...'
      default: return `Action : ${action.action}`
    }
  }

  private buildSystemPrompt(workflow: AgentWorkflow, userInputs: Record<string, string>): string {
    return `Tu es l'Agent Tloush. Tu aides les francophones en Israël à naviguer sur les sites web israéliens en hébreu.

TÂCHE : ${workflow.description_fr}

DONNÉES UTILISATEUR :
${Object.entries(userInputs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

RÈGLES DE NAVIGATION :
1. Tu lis l'hébreu sur les captures d'écran et tu traduis/expliques tout en français.
2. Tu navigues étape par étape : un clic ou une action à la fois.
3. Après chaque action, attends la capture d'écran avant de continuer.

INTERACTION AVEC L'UTILISATEUR :
Quand tu rencontres un obstacle que tu ne peux pas résoudre seul, utilise ces marqueurs EXACTS dans ton texte :

- [CAPTCHA] — Quand tu vois un CAPTCHA ou vérification visuelle
  Exemple : "Je vois un CAPTCHA sur la page. [CAPTCHA] L'utilisateur doit entrer le texte affiché."

- [MOT_DE_PASSE] — Quand un champ mot de passe est requis
  Exemple : "Le site demande un mot de passe. [MOT_DE_PASSE] L'utilisateur doit saisir son mot de passe."

- [CODE_SMS] — Quand un code SMS/OTP est envoyé
  Exemple : "Un code SMS a été envoyé. [CODE_SMS] L'utilisateur doit entrer le code reçu."

- [SAISIE_UTILISATEUR] — Quand toute autre saisie manuelle est nécessaire
  Exemple : "Ce champ nécessite une information que je n'ai pas. [SAISIE_UTILISATEUR]"

- [CONFIRMATION] — Avant de soumettre un formulaire ou faire un paiement
  Exemple : "Je vais soumettre le formulaire avec ces données : ... [CONFIRMATION]"

IMPORTANT :
- Ne saisis JAMAIS un mot de passe toi-même. Utilise toujours [MOT_DE_PASSE].
- Ne tente JAMAIS de résoudre un CAPTCHA. Utilise toujours [CAPTCHA].
- Avant toute soumission de formulaire, utilise [CONFIRMATION].
- Si tu es bloqué, explique la situation en français et propose des alternatives.
- Résume toujours ce que tu vois à l'écran en français pour que l'utilisateur comprenne.`
  }

  private async emitStep(
    onStep: StepCallback,
    partial: Omit<AgentStep, 'id' | 'timestamp'>,
  ): Promise<void> {
    this.stepCounter++
    const step: AgentStep = {
      id: `step-${this.stepCounter}`,
      timestamp: Date.now(),
      ...partial,
    }
    await onStep(step)
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
        this.page = null
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}
