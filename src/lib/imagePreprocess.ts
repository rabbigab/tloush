import sharp from 'sharp'

interface PreprocessResult {
  buffer: Buffer
  enhanced: boolean
  quality: 'good' | 'medium' | 'poor'
  appliedFixes: string[]
}

/**
 * Analyze image quality and enhance if needed for better OCR/AI analysis.
 * Returns the processed buffer + metadata about what was done.
 */
export async function preprocessImage(inputBuffer: Buffer, mimeType: string): Promise<PreprocessResult> {
  // Skip PDFs — Claude handles them natively
  if (mimeType === 'application/pdf') {
    return { buffer: inputBuffer, enhanced: false, quality: 'good', appliedFixes: [] }
  }

  const appliedFixes: string[] = []
  let img = sharp(inputBuffer)
  const metadata = await img.metadata()

  // 1. Assess image quality
  const quality = assessQuality(metadata, inputBuffer.length)

  // If image looks fine, just do minimal processing
  if (quality === 'good') {
    return { buffer: inputBuffer, enhanced: false, quality, appliedFixes: [] }
  }

  // 2. Convert to sRGB colorspace if needed (some scans use CMYK)
  if (metadata.space && metadata.space !== 'srgb') {
    img = img.toColorspace('srgb')
    appliedFixes.push('colorspace_fix')
  }

  // 3. Resize if image is very small (< 1000px wide) — upscale for better readability
  if (metadata.width && metadata.width < 1000) {
    const scaleFactor = Math.min(2, 1500 / metadata.width)
    img = img.resize({
      width: Math.round(metadata.width * scaleFactor),
      fit: 'inside',
      kernel: 'lanczos3',
    })
    appliedFixes.push('upscale')
  }

  // 4. Resize if image is too large (> 4000px) — reduce to save tokens & improve speed
  if (metadata.width && metadata.width > 4000) {
    img = img.resize({
      width: 3000,
      fit: 'inside',
      kernel: 'lanczos3',
    })
    appliedFixes.push('downscale')
  }

  // 5. Convert to grayscale — better contrast for document text
  img = img.grayscale()
  appliedFixes.push('grayscale')

  // 6. Normalize (auto-level) — stretches contrast across full range
  img = img.normalize()
  appliedFixes.push('normalize')

  // 7. Sharpen — makes text edges crisper
  img = img.sharpen({
    sigma: 1.5,
    m1: 1.0,  // flat areas sharpening
    m2: 2.0,  // jagged areas sharpening
  })
  appliedFixes.push('sharpen')

  // 8. Increase contrast slightly for washed-out scans
  if (quality === 'poor') {
    img = img.linear(1.3, -30) // contrast boost + brightness adjust
    appliedFixes.push('contrast_boost')
  }

  // 9. Output as high-quality PNG for best text clarity
  const outputBuffer = await img.png({ quality: 95 }).toBuffer()

  return {
    buffer: outputBuffer,
    enhanced: true,
    quality,
    appliedFixes,
  }
}

/**
 * Heuristic quality assessment based on image metadata and file size.
 */
function assessQuality(
  metadata: sharp.Metadata,
  fileSize: number
): 'good' | 'medium' | 'poor' {
  const width = metadata.width || 0
  const height = metadata.height || 0
  const pixels = width * height

  // Very small image — likely a bad photo or tiny scan
  if (width < 600 || height < 600) return 'poor'

  // Small image with low file size — heavily compressed
  if (width < 1200 && fileSize < 100_000) return 'poor'

  // Low resolution relative to typical A4 scan (300dpi ≈ 2480×3508)
  if (pixels < 1_000_000) return 'poor'

  // Medium: decent size but could be better
  if (pixels < 2_500_000 || fileSize < 200_000) return 'medium'

  // Large enough with reasonable file size — probably good
  return 'good'
}

/**
 * Build a quality hint for Claude's system prompt so it knows
 * the document may have readability issues.
 */
export function buildQualityHint(result: PreprocessResult): string {
  if (result.quality === 'good') return ''

  const hints: string[] = []

  if (result.quality === 'poor') {
    hints.push(`ATTENTION — DOCUMENT DE MAUVAISE QUALITÉ DÉTECTÉ.
Ce scan/photo est de basse résolution ou de mauvaise qualité. Des améliorations ont été appliquées (${result.appliedFixes.join(', ')}).
Instructions spéciales :
- Essaie de lire chaque caractère attentivement, même s'il est flou
- Si un chiffre est ambigu (ex: 5 ou 6, 1 ou 7), indique les deux possibilités : "5 (ou possiblement 6)"
- Si une ligne est totalement illisible, indique "illisible" mais décris ce que tu peux deviner du contexte
- Concentre-toi d'abord sur les montants, dates et noms — ce sont les infos les plus critiques
- Si tu vois un tableau, essaie de reconstruire sa structure même si certaines cellules sont floues`)
  } else {
    hints.push(`NOTE : La qualité du document est moyenne. Des améliorations ont été appliquées (${result.appliedFixes.join(', ')}). Fais particulièrement attention aux chiffres qui pourraient être difficiles à lire.`)
  }

  return '\n\n' + hints.join('\n')
}
