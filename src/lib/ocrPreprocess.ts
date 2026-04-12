import Tesseract from 'tesseract.js'

interface OcrResult {
  text: string
  confidence: number
  pageCount: number
  languages: string[]
}

// =====================================================
// Worker pool — reutilise le worker Tesseract entre requetes
// Evite de telecharger le modele a chaque appel (~5-20s economises)
// =====================================================
let workerInstance: Tesseract.Worker | null = null
let workerInitializing: Promise<Tesseract.Worker> | null = null

async function getWorker(): Promise<Tesseract.Worker> {
  if (workerInstance) return workerInstance

  // Eviter les initialisations paralleles
  if (workerInitializing) return workerInitializing

  workerInitializing = (async () => {
    const worker = await Tesseract.createWorker('heb+eng', undefined, {
      logger: () => {},
    })
    workerInstance = worker
    workerInitializing = null
    return worker
  })()

  return workerInitializing
}

/**
 * Execute une promesse avec un timeout.
 * Si le timeout est atteint, retourne le fallback.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ])
}

const OCR_TIMEOUT_MS = 8000 // 8 secondes max pour l'OCR

const EMPTY_RESULT: OcrResult = { text: '', confidence: 0, pageCount: 0, languages: [] }

/**
 * Pre-OCR step with Tesseract.js (hébreu + anglais).
 * Extracts text from an image buffer before sending to Claude.
 * This gives Claude both the visual AND the extracted text for cross-validation.
 *
 * Utilise un worker pool (pas de re-initialisation a chaque appel)
 * et un timeout de 8s pour eviter les blocages.
 */
export async function extractTextFromImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<OcrResult> {
  // Skip PDFs — Claude handles PDF text extraction natively
  if (mimeType === 'application/pdf') {
    return EMPTY_RESULT
  }

  try {
    const startTime = Date.now()

    const worker = await withTimeout(getWorker(), 5000, null as Tesseract.Worker | null)
    if (!worker) {
      console.warn('[ocr] Worker init timeout after 5s, skipping OCR')
      return EMPTY_RESULT
    }

    const ocrPromise = (async () => {
      const result = await worker.recognize(imageBuffer)
      return result
    })()

    const result = await withTimeout(ocrPromise, OCR_TIMEOUT_MS, null)

    if (!result) {
      console.warn(`[ocr] Tesseract timeout after ${OCR_TIMEOUT_MS}ms, skipping OCR`)
      return EMPTY_RESULT
    }

    const duration = Date.now() - startTime
    const confidence = result.data.confidence
    const text = result.data.text.trim()

    console.log(`[ocr] Tesseract completed in ${duration}ms, confidence=${confidence}%, text length=${text.length} chars`)

    return {
      text,
      confidence,
      pageCount: 1,
      languages: ['heb', 'eng'],
    }
  } catch (err) {
    console.error('[ocr] Tesseract failed:', err instanceof Error ? err.message : err)
    return EMPTY_RESULT
  }
}

/**
 * Build a prompt section with the OCR-extracted text for Claude.
 * Claude can use this to cross-validate against the visual.
 */
export function buildOcrContext(ocrResult: OcrResult): string {
  if (!ocrResult.text || ocrResult.text.length < 20) {
    return ''
  }

  const confidenceNote = ocrResult.confidence >= 80
    ? 'Qualité OCR : bonne'
    : ocrResult.confidence >= 50
    ? 'Qualité OCR : moyenne — vérifie visuellement les chiffres'
    : 'Qualité OCR : faible — le texte ci-dessous peut contenir des erreurs, fais confiance au visuel en priorité'

  return `

=== TEXTE OCR PRÉ-EXTRAIT (Tesseract hébreu+anglais) ===
${confidenceNote} (confiance : ${Math.round(ocrResult.confidence)}%)
Utilise ce texte pour VÉRIFIER ta lecture visuelle du document. En cas de doute entre le texte OCR et ce que tu vois sur l'image, indique les deux possibilités.

--- DÉBUT TEXTE OCR ---
${ocrResult.text.slice(0, 8000)}
--- FIN TEXTE OCR ---
`
}
