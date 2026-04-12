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

  // Meme pour les images "good", downscaler si trop grande
  // (les photos smartphone font 3000-4000px → 2-5MB base64 → tres lent pour l'API)
  if (quality === 'good' && metadata.width && metadata.width > 2000) {
    const resized = await sharp(inputBuffer)
      .resize({ width: 2000, fit: 'inside', kernel: 'lanczos3' })
      .normalize()
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
      .jpeg({ quality: 90 })
      .toBuffer()
    return { buffer: resized, enhanced: true, quality, appliedFixes: ['downscale_large', 'normalize', 'sharpen'] }
  }

  // Pour les images "good" de taille normale, appliquer quand meme
  // normalize + sharpen pour ameliorer la lisibilite de l'hebreu
  if (quality === 'good') {
    const enhanced = await sharp(inputBuffer)
      .normalize()
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
      .jpeg({ quality: 90 })
      .toBuffer()
    return { buffer: enhanced, enhanced: true, quality, appliedFixes: ['normalize', 'sharpen'] }
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

  // 4. Resize if image is too large (> 2000px) — reduce for faster API calls
  //    Claude Vision fonctionne tres bien a 1500-2000px. Au-dela, ca ralentit sans gain.
  if (metadata.width && metadata.width > 2000) {
    img = img.resize({
      width: 2000,
      fit: 'inside',
      kernel: 'lanczos3',
    })
    appliedFixes.push('downscale')
  }

  // 5. Normalize (auto-level) — stretches contrast across full range
  //    Keep color: many Israeli payslips use colored sections that help
  //    Claude Vision distinguish payments/deductions/totals.
  img = img.normalize()
  appliedFixes.push('normalize')

  // 6. Gentle sharpening — makes text edges crisper without creating
  //    halos. More aggressive sharpening hurts Claude Vision accuracy.
  img = img.sharpen({
    sigma: 0.8,
    m1: 0.5,  // flat areas sharpening (gentle)
    m2: 1.5,  // jagged areas sharpening (moderate)
  })
  appliedFixes.push('sharpen')

  // 7. Increase contrast slightly for washed-out scans
  if (quality === 'poor') {
    img = img.linear(1.2, -15) // lighter contrast boost
    appliedFixes.push('contrast_boost')
  }

  // 9. Output as JPEG (plus leger que PNG pour les photos)
  const outputBuffer = await img.jpeg({ quality: 90 }).toBuffer()

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
