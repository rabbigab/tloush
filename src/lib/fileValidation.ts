import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp']

const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],       // \x89PNG
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],       // RIFF header
}

function matchesMagicBytes(buffer: ArrayBuffer, mime: string): boolean {
  const signatures = MAGIC_BYTES[mime]
  if (!signatures) return true
  const bytes = new Uint8Array(buffer)
  return signatures.some(sig => sig.every((b, i) => bytes[i] === b))
}

// WebP requires RIFF at offset 0 AND 'WEBP' at offset 8
function validateWebP(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 12) return false
  const webp = [0x57, 0x45, 0x42, 0x50] // WEBP
  return webp.every((b, i) => bytes[8 + i] === b)
}

// =====================================================
// Malicious content detection (no ClamAV required)
// =====================================================

// PDF patterns that indicate active content / embedded malware
const PDF_DANGEROUS_PATTERNS = [
  /\/JavaScript\b/i,
  /\/JS\b/i,
  /\/Launch\b/i,
  /\/EmbeddedFile\b/i,
  /\/RichMedia\b/i,
  /\/XFA\b/i,
  // Obfuscated JS via hex encoding common in malicious PDFs
  /\/J[Ss]\s*<</,
]

// Script injection patterns for polyglot files (HTML/JS embedded in image)
const POLYGLOT_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /<iframe[\s>]/i,
  /on(?:load|error|click)=/i,
]

function scanForMaliciousContent(bytes: Uint8Array, mime: string): string | null {
  // Scan only the first 512KB to limit CPU cost
  const scanLength = Math.min(bytes.length, 512 * 1024)
  const text = new TextDecoder('latin1').decode(bytes.subarray(0, scanLength))

  if (mime === 'application/pdf') {
    for (const pattern of PDF_DANGEROUS_PATTERNS) {
      if (pattern.test(text)) {
        return `PDF avec contenu actif détecté (${pattern.source.slice(0, 20)})`
      }
    }
  }

  // Check all types for polyglot / HTML injection
  for (const pattern of POLYGLOT_PATTERNS) {
    if (pattern.test(text)) {
      return 'Contenu suspect détecté dans le fichier'
    }
  }

  return null
}

export async function validateFile(file: File): Promise<NextResponse | null> {
  // 1. Size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (max 25 Mo)' },
      { status: 413 }
    )
  }

  // 2. MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Type de fichier non supporté. Formats acceptés : PDF, JPG, PNG' },
      { status: 400 }
    )
  }

  // 3. Extension
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: 'Extension de fichier non supportée' },
      { status: 400 }
    )
  }

  // 4. Read first 16 bytes for magic bytes check
  const headerBuffer = await file.slice(0, 16).arrayBuffer()
  if (!matchesMagicBytes(headerBuffer, file.type)) {
    return NextResponse.json(
      { error: 'Le contenu du fichier ne correspond pas au type déclaré' },
      { status: 400 }
    )
  }

  // 5. WebP: validate RIFF + WEBP at offset 8
  if (file.type === 'image/webp' && !validateWebP(headerBuffer)) {
    return NextResponse.json(
      { error: 'Fichier WebP invalide' },
      { status: 400 }
    )
  }

  // 6. Malicious content scan (first 512KB)
  const scanBuffer = await file.slice(0, 512 * 1024).arrayBuffer()
  const malwareHit = scanForMaliciousContent(new Uint8Array(scanBuffer), file.type)
  if (malwareHit) {
    console.warn('[fileValidation] Malicious content detected:', malwareHit, 'file:', file.name, 'type:', file.type)
    return NextResponse.json(
      { error: 'Ce fichier a été refusé pour des raisons de sécurité.' },
      { status: 400 }
    )
  }

  return null // valid
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
