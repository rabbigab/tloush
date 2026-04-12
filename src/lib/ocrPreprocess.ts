import Tesseract from 'tesseract.js'

interface OcrResult {
  text: string
  confidence: number
  pageCount: number
  languages: string[]
}

/**
 * Pre-OCR step with Tesseract.js (hébreu + anglais).
 * Extracts text from an image buffer before sending to Claude.
 * This gives Claude both the visual AND the extracted text for cross-validation.
 */
export async function extractTextFromImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<OcrResult> {
  // Skip PDFs — Claude handles PDF text extraction natively
  if (mimeType === 'application/pdf') {
    return { text: '', confidence: 0, pageCount: 0, languages: [] }
  }

  try {
    const startTime = Date.now()

    const result = await Tesseract.recognize(imageBuffer, 'heb+eng', {
      logger: () => {}, // suppress progress logs
    })

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
    return { text: '', confidence: 0, pageCount: 0, languages: [] }
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
