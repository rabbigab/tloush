import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.REVIEW_TOKEN_SECRET || 'dev-review-token-secret-change-in-production'
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
