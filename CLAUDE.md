# CLAUDE.md - Tloush Project

## Project Overview

Tloush is a SaaS web app for French-speaking residents in Israel to analyze and understand Hebrew administrative documents (paystubs, tax forms, social benefits) in French. Built with Next.js 14, TypeScript, Supabase, and Claude AI.

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript strict
- **Styling**: Tailwind CSS (no custom CSS)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Anthropic Claude Sonnet (`@anthropic-ai/sdk`)
- **Payments**: Stripe
- **Email**: Resend
- **Analytics**: PostHog, Vercel Analytics, Sentry
- **Deployment**: Vercel

## Code Standards

- TypeScript `strict: true` mandatory
- Use `@/` alias for imports (no relative paths)
- Server Components by default, `'use client'` only for interactive UI
- Client components named `*Client.tsx`
- No `any` types, handle `undefined`/`null` explicitly
- Palette: `slate-*` (neutral), `blue-600/700` (primary)
- Layout: `max-w-3xl` (inbox), `max-w-5xl` (assistant sidebar)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint check
npm run type-check   # TypeScript check
npm run test         # Run tests (vitest)
```

## Marketing Skills (63 skills installed)

Skills are in `.claude/skills/` organized in 5 categories. See `.claude/skills/MARKETING-README.md` for the full inventory.

### Quick Reference

| Category | Skills | Use For |
|----------|--------|---------|
| `paid-ads/` | 14 | Meta/Google/TikTok/YouTube/LinkedIn ads creation & audit |
| `ads-audit/` | 4 + research | Full ads audit (190+ checks), competitor intelligence |
| `content-copy/` | 15 | Copywriting, social content, email sequences, landing pages |
| `cro-analytics/` | 11 | CRO, A/B testing, analytics, churn prevention |
| `strategy/` | 18 | Launch, pricing, competitors, brand, SEO, campaign planning |

### Tloush Marketing Context

- **Product**: Tloush - Analyse de documents administratifs israeliens en francais
- **Target audience**: Francophones en Israel (olim, expats, etudiants) - 50k-100k personnes
- **Pricing**: Freemium - 20-50 NIS/mois pour l'abonnement
- **Primary channels**: Facebook/Instagram (communautes francophones Israel), Google Ads
- **Secondary channels**: TikTok, groups WhatsApp/Telegram francophones
- **Language**: Ads in French, geo-targeting Israel
- **Key value prop**: "Comprenez enfin votre fiche de paie israelienne - en francais"
- **Pain points**: Documents en hebreu incomprehensibles, alternatives couteuses (comptables/avocats)
- **Competitors**: Google Translate (literal, no context), accountants (expensive), Facebook groups (slow, unreliable)
