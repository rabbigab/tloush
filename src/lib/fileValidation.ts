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
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

function matchesMagicBytes(buffer: ArrayBuffer, mime: string): boolean {
  const signatures = MAGIC_BYTES[mime]
  if (!signatures) return true
  const bytes = new Uint8Array(buffer)
  return signatures.some(sig => sig.every((b, i) => bytes[i] === b))
}

export async function validateFile(file: File): Promise<NextResponse | null> {
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (max 25 Mo)' },
      { status: 413 }
    )
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Type de fichier non supporté. Formats acceptés : PDF, JPG, PNG' },
      { status: 400 }
    )
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: 'Extension de fichier non supportée' },
      { status: 400 }
    )
  }

  const buffer = await file.slice(0, 16).arrayBuffer()
  if (!matchesMagicBytes(buffer, file.type)) {
    return NextResponse.json(
      { error: 'Le contenu du fichier ne correspond pas au type déclaré' },
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
