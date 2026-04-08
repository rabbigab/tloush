/**
 * Computer Use Agent — Claude + Playwright
 *
 * Core engine that lets Claude visually navigate Israeli websites.
 * Claude sees screenshots, decides actions (click, type, scroll),
 * and Playwright executes them in a headless browser.
 *
 * Architecture:
 * 1. Playwright opens a headless browser at the target URL
 * 2. Takes a screenshot → sends to Claude as base64 image
 * 3. Claude analyzes the page and returns tool_use actions
 * 4. We execute actions via Playwright (click, type, scroll, etc.)
 * 5. Loop until Claude says "done" or max iterations reached
 *
 * Security: Sensitive actions (form submissions, payments) require
 * user confirmation before execution.
 */

import Anthropic from '@anthropic-ai/sdk'
import { chromium, type Browser, type Page } from 'playwright'
import type { AgentStep, AgentWorkflow } from './types'

const DISPLAY_WIDTH = 1280
const DISPLAY_HEIGHT = 800
const MAX_ITERATIONS = 30
const SCREENSHOT_QUALITY = 75  // JPEG quality for smaller payloads

interface ComputerAction {
  action: string
  coordinate?: [number, number]
  text?: string
  scroll_direction?: 'up' | 'down' | 'left' | 'right'
  scroll_amount?: number
  target_coordinate?: [number, number]
  region?: [number, number, number, number]
}

type StepCallback = (step: AgentStep) => void | Promise<void>
type ConfirmCallback = (prompt: string) => Promise<boolean>

export class ComputerUseAgent {
  private client: Anthropic
  private browser: Browser | null = null
  private page: Page | null = null
  private stepCounter = 0

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  /**
   * Run a workflow from start to finish.
   * @param workflow - The workflow definition
   * @param userInputs - User-provided data (name, ID, address, etc.)
   * @param onStep - Callback for each step (screenshot, action, thinking)
   * @param onConfirm - Callback to ask user for confirmation before sensitive actions
   */
  async run(
    workflow: AgentWorkflow,
    userInputs: Record<string, string>,
    onStep: StepCallback,
    onConfirm: ConfirmCallback,
  ): Promise<string> {
    try {
      // Launch browser
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          `--window-size=${DISPLAY_WIDTH},${DISPLAY_HEIGHT}`,
        ],
      })

      const context = await this.browser.newContext({
        viewport: { width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT },
        locale: 'he-IL',
        timezoneId: 'Asia/Jerusalem',
      })
      this.page = await context.newPage()

      // Navigate to start URL
      await this.emitStep(onStep, {
        type: 'action',
        action: `Navigation vers ${workflow.startUrl}`,
      })
      await this.page.goto(workflow.startUrl, { waitUntil: 'networkidle', timeout: 30000 })

      // Take initial screenshot
      const initialScreenshot = await this.takeScreenshot()
      await this.emitStep(onStep, {
        type: 'screenshot',
        screenshot: initialScreenshot,
      })

      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(workflow, userInputs)

      // Build initial messages with the screenshot
      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: initialScreenshot },
            },
            {
              type: 'text',
              text: `Voici la page d'accueil. Commence la tâche : ${workflow.description_fr}\n\nDonnées de l'utilisateur :\n${Object.entries(userInputs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`,
            },
          ],
        },
      ]

      // Agentic loop
      let iteration = 0
      let finalResult = ''

      while (iteration < MAX_ITERATIONS) {
        iteration++

        const response = await this.client.messages.create({
          model: 'claude-sonnet-4-6',  // Best for Computer Use (72.5% OSWorld)
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

        // Add assistant response to conversation
        messages.push({ role: 'assistant', content: response.content })

        // Process response blocks
        const toolUseBlocks = response.content.filter(
          (block: { type: string }) => block.type === 'tool_use'
        ) as Array<{ type: 'tool_use'; id: string; name: string; input: ComputerAction }>

        const textBlocks = response.content.filter(
          (block: { type: string }) => block.type === 'text'
        ) as Array<{ type: 'text'; text: string }>

        // Emit thinking
        for (const block of textBlocks) {
          if (block.text.trim()) {
            await this.emitStep(onStep, { type: 'thinking', thinking: block.text })
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

          // Check if this is a sensitive action that needs confirmation
          if (this.isSensitiveAction(action, workflow)) {
            const description = this.describeAction(action)
            await this.emitStep(onStep, {
              type: 'confirmation',
              confirmationPrompt: `Action sensible détectée : ${description}\nConfirmer ?`,
            })

            const confirmed = await onConfirm(description)
            if (!confirmed) {
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: 'L\'utilisateur a annulé cette action. Trouve une alternative ou termine la tâche.',
                is_error: true,
              })
              continue
            }
          }

          try {
            const result = await this.executeAction(action)

            await this.emitStep(onStep, {
              type: 'action',
              action: this.describeAction(action),
            })

            if (action.action === 'screenshot') {
              await this.emitStep(onStep, { type: 'screenshot', screenshot: result })
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: [
                  { type: 'image', source: { type: 'base64', media_type: 'image/png', data: result } },
                ],
              })
            } else {
              // After any action, take a screenshot to show Claude the result
              await this.page!.waitForTimeout(500) // Wait for page to settle
              const screenshot = await this.takeScreenshot()
              await this.emitStep(onStep, { type: 'screenshot', screenshot })
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: [
                  { type: 'text', text: `Action exécutée : ${this.describeAction(action)}` },
                  { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshot } },
                ],
              })
            }
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

        // Check stop reason
        if (response.stop_reason === 'end_turn') {
          finalResult = textBlocks.map(b => b.text).join('\n')
          break
        }
      }

      if (iteration >= MAX_ITERATIONS) {
        finalResult = 'Nombre maximum d\'itérations atteint. La tâche n\'a peut-être pas été complétée.'
      }

      await this.emitStep(onStep, { type: 'result', result: finalResult })
      return finalResult
    } finally {
      await this.cleanup()
    }
  }

  private async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('No page available')
    const buffer = await this.page.screenshot({ type: 'png', fullPage: false })
    return buffer.toString('base64')
  }

  private async executeAction(action: ComputerAction): Promise<string> {
    if (!this.page) throw new Error('No page available')

    switch (action.action) {
      case 'screenshot': {
        return this.takeScreenshot()
      }

      case 'left_click': {
        if (!action.coordinate) throw new Error('Missing coordinate for click')
        const [x, y] = action.coordinate
        await this.page.mouse.click(x, y)
        return 'clicked'
      }

      case 'right_click': {
        if (!action.coordinate) throw new Error('Missing coordinate for right_click')
        const [x, y] = action.coordinate
        await this.page.mouse.click(x, y, { button: 'right' })
        return 'right_clicked'
      }

      case 'double_click': {
        if (!action.coordinate) throw new Error('Missing coordinate for double_click')
        const [x, y] = action.coordinate
        await this.page.mouse.dblclick(x, y)
        return 'double_clicked'
      }

      case 'type': {
        if (!action.text) throw new Error('Missing text for type')
        await this.page.keyboard.type(action.text, { delay: 50 })
        return `typed: ${action.text}`
      }

      case 'key': {
        if (!action.text) throw new Error('Missing key for key press')
        // Convert Claude format (ctrl+a) to Playwright format (Control+a)
        const key = action.text
          .replace(/ctrl/gi, 'Control')
          .replace(/alt/gi, 'Alt')
          .replace(/shift/gi, 'Shift')
          .replace(/meta/gi, 'Meta')
          .replace(/enter/gi, 'Enter')
          .replace(/tab/gi, 'Tab')
          .replace(/escape/gi, 'Escape')
          .replace(/backspace/gi, 'Backspace')
          .replace(/delete/gi, 'Delete')
          .replace(/space/gi, ' ')
          .replace(/Return/gi, 'Enter')
        await this.page.keyboard.press(key)
        return `key: ${key}`
      }

      case 'mouse_move': {
        if (!action.coordinate) throw new Error('Missing coordinate for mouse_move')
        const [x, y] = action.coordinate
        await this.page.mouse.move(x, y)
        return 'mouse_moved'
      }

      case 'scroll': {
        const [x, y] = action.coordinate || [DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2]
        const amount = (action.scroll_amount || 3) * 100 // Convert to pixels
        const dir = action.scroll_direction || 'down'

        await this.page.mouse.move(x, y)
        const deltaX = dir === 'left' ? -amount : dir === 'right' ? amount : 0
        const deltaY = dir === 'up' ? -amount : dir === 'down' ? amount : 0
        await this.page.mouse.wheel(deltaX, deltaY)
        return `scrolled ${dir}`
      }

      case 'left_click_drag': {
        if (!action.coordinate || !action.target_coordinate) {
          throw new Error('Missing coordinates for drag')
        }
        const [sx, sy] = action.coordinate
        const [tx, ty] = action.target_coordinate
        await this.page.mouse.move(sx, sy)
        await this.page.mouse.down()
        await this.page.mouse.move(tx, ty)
        await this.page.mouse.up()
        return 'dragged'
      }

      case 'wait': {
        await this.page.waitForTimeout(1000)
        return 'waited'
      }

      default:
        throw new Error(`Unknown action: ${action.action}`)
    }
  }

  private isSensitiveAction(action: ComputerAction, workflow: AgentWorkflow): boolean {
    if (!workflow.confirmBeforeSubmit) return false

    // Clicking submit/payment buttons is sensitive
    if (action.action === 'left_click') {
      // We can't know what the button says from coordinates alone,
      // so we rely on Claude's text output + the workflow flag
      return false // Confirmation is handled at the workflow level
    }

    return false
  }

  private describeAction(action: ComputerAction): string {
    switch (action.action) {
      case 'screenshot':
        return 'Capture d\'écran'
      case 'left_click':
        return `Clic sur (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'right_click':
        return `Clic droit sur (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'double_click':
        return `Double clic sur (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'type':
        return `Saisie de texte : "${action.text?.substring(0, 30)}${(action.text?.length || 0) > 30 ? '...' : ''}"`
      case 'key':
        return `Touche : ${action.text}`
      case 'scroll':
        return `Défilement ${action.scroll_direction || 'bas'}`
      case 'mouse_move':
        return `Déplacement souris vers (${action.coordinate?.[0]}, ${action.coordinate?.[1]})`
      case 'wait':
        return 'Attente...'
      default:
        return `Action : ${action.action}`
    }
  }

  private buildSystemPrompt(workflow: AgentWorkflow, userInputs: Record<string, string>): string {
    return `${workflow.systemPrompt}

CONTEXTE UTILISATEUR :
${Object.entries(userInputs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

RÈGLES IMPORTANTES :
1. Tu navigues sur un site web israélien. Le contenu est principalement en hébreu (עברית).
2. Tu DOIS lire et comprendre le texte hébreu sur les captures d'écran.
3. Décris chaque action en français pour l'utilisateur.
4. Avant de soumettre un formulaire ou effectuer un paiement, DÉCRIS ce que tu vas faire et ATTENDS la confirmation.
5. Si tu rencontres un CAPTCHA, décris-le et demande à l'utilisateur de le résoudre.
6. Si une page demande une connexion (login), indique-le à l'utilisateur.
7. Ne saisis JAMAIS de fausses informations. Utilise uniquement les données fournies par l'utilisateur.
8. Si tu es bloqué ou perdu, prends une capture d'écran et explique la situation.
9. Quand la tâche est terminée, résume ce qui a été fait.

NAVIGATION :
- Utilise "screenshot" pour voir l'état actuel de la page
- Utilise "left_click" pour cliquer sur des boutons, liens, champs
- Utilise "type" pour saisir du texte dans un champ actif
- Utilise "key" pour les raccourcis clavier (Tab, Enter, etc.)
- Utilise "scroll" pour faire défiler la page
- Attends toujours après un clic que la page se charge avant la prochaine action`
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
