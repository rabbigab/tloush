import { SignJWT, jwtVerify } from 'jose'

if (!process.env.REVIEW_TOKEN_SECRET) {
  console.warn('[reviewTokens] REVIEW_TOKEN_SECRET is not set — review links will not work')
}

const SECRET = new TextEncoder().encode(
  process.env.REVIEW_TOKEN_SECRET || ''
)

interface ReviewTokenPayload {
  userId: string
  providerId: string
}

export async function generateReviewToken(userId: string, providerId: string): Promise<string> {
  return new SignJWT({ userId, providerId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET)
}

export async function verifyReviewToken(token: string): Promise<ReviewTokenPayload> {
  const { payload } = await jwtVerify(token, SECRET)
  return {
    userId: payload.userId as string,
    providerId: payload.providerId as string,
  }
}
