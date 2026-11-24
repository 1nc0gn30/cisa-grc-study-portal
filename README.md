# CISA GRC Study Portal

An open-access, browser-based CISA & GRC exam preparation workstation built with React, TypeScript, and Tailwind CSS. Every simulator mode, flashcard deck, 30-day study module, and GRC calculator runs 100% client-side with `localStorage` persistence—zero paywalls, zero sign-ups, and zero telemetry.

- **Live Portal**: https://cisa-grc-study-portal.nealfrazier.tech/
- **Repository**: https://github.com/1nc0gn30/cisa-grc-study-portal

## What It Includes

- **Pass-Plan Dashboard**: Tracks Readiness Index, unofficial CISA 200–800 scaled score estimate (450 pass mark), weighted 5-domain accuracy gaps, and one-click weak-domain drills.
- **Weighted Exam Simulator (135+ Questions)**:
  - Official CISA 5-domain weighting (`D1 21%`, `D2 17%`, `D3 12%`, `D4 23%`, `D5 27%`), plus **Weak-Domain Drill** and single-domain targeting.
  - **Exam Mode** (ISACA simulation) and **Study Mode** (instant distractor rationale).
  - Standard elapsed timer or per-question countdown timer, question flagging (`F`), and full keyboard shortcuts (`1–4` answer, `Enter` / `→` next, `←` previous).
- **Adaptive Flashcards**: Filter by domain or **Review Queue Only**, with keyboard controls (`Space` flip, `←`/`→` navigate, `M` mastered, `R` needs review).
- **30-Day CISA Master Plan**: 30 daily modules with real-world examples, deep explanations, and four persisted 15-minute learning blocks per day.
- **GRC Decision Tools**: Inherent vs. residual risk calculator, exam date study-hour allocator, and control type rapid classifier.
- **Local-First Backup & Study Notes**: Export/import progress JSON backups and download a structured Weak-Area Action Sheet (`.md`) or print your study summary.
- **Optional BYOK AI Study Assistant**: Bring your own OpenAI, Gemini, or local Ollama endpoint directly from the browser.

## Local Development & Verification

```bash
npm install
npm run dev      # Start Vite dev server on :3000
npm run lint     # TypeScript type-check (tsc --noEmit)
npm run build    # Production bundle in dist/
npm test         # Run engine unit tests + production SEO/AEO guardrail checks
```

## Attribution & Support

Engineered by **Neal Frazier Tech** ([@1nc0gn30](https://github.com/1nc0gn30)) • [NullAI Platform](https://nullai.tech)

- Free & open-access under community support: [Buy Us a Coffee](https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X)
- Solana Tip: `GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK`
