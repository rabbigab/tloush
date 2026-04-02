import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp']

export function validateFile(file: File): NextResponse | null {
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (max 10 Mo)' },
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
