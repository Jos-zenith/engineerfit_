# engineerfit

engineerfit is a deterministic career intelligence platform for engineering students and recruiters.
It is designed around one core belief: potential should be measured by evidence from behavior and problem-solving signals, not by resume polish, spoken fluency, or pedigree.

## Ideology

1. Merit Through Measurable Signals
The platform models candidate potential from structured responses, confidence levels, and adaptive psychometric performance instead of subjective interviews alone.

2. Fairness For Tier-2/Tier-3 Talent
The system prioritizes signal quality over presentation quality, reducing bias from language and socioeconomic background.

3. Deterministic Matching
Matching logic is explicit and reproducible. Given the same candidate vector and role vector, the fit outcome is stable and explainable.

4. Explainability Over Black-Box Ranking
Both students and recruiters see why a score exists, not just what the score is.

## Product Surfaces

1. Student Experience
- Adaptive assessment flow with IRT-driven question selection.
- Career-fit dashboard with score breakdowns and visual analytics.
- Report generation for student-facing guidance.

2. Recruiter Experience
- Recruiter dashboard with candidate fit insights.
- Threshold-based screening using minimum fit and career-hygiene requirements.
- Role-to-candidate compatibility using vector similarity.

## Technical Architecture

1. Frontend
- Framework: Next.js 16 (App Router) with React 19 and TypeScript.
- Styling: Tailwind CSS v4 + design primitives from Radix UI.
- Motion/UX: Framer Motion for transitions and progressive interaction patterns.
- Visualization: Recharts for score and persona charting.

2. Backend (within Next.js)
- Route handlers under app/api for:
	- assessment session lifecycle (start, answer, complete)
	- assessment question delivery and submission
	- auth profile resolution
	- recruiter dashboard aggregation
	- student profile and PDF report generation
- Business logic modules in lib for scoring, IRT, matching, and auth-aware fetching.

3. Data + Auth
- Local Prisma + SQLite for persistence.
- NextAuth credentials sessions for identity.
- Process-local caches and mock models keep demo flows usable without external services.
- Schema includes:
	- profiles
	- assessment_sessions
	- assessment_attempts
	- assessment_responses
	- recruiter job cache is kept in memory for demo mode.

## Core Scoring Engine

1. IRT-Adaptive Ability Estimation
- `lib/irt.ts` implements:
	- logistic probability of correctness
	- item information calculation
	- MAP-style theta estimation with iterative updates
	- bounded theta normalization
- Next question is selected by maximum information at current theta.

2. Vector-Based Role Fit
- `lib/matching.ts` implements cosine similarity between student and role vectors.
- Similarity is transformed into recruiter-friendly percentage scores.

3. Composite Assessment Outputs
- Assessment attempts persist multi-axis scoring (cognitive, behavioral, domain, role alignment, career hygiene, retention signal) plus IRT outputs.

## Security and Integrity Model

1. Auth-scoped Data Access
- RLS policies ensure students can only access their own attempts/sessions/responses.
- Recruiters can only manage their own postings.

2. Deterministic Evaluation Path
- Assessment state is tracked in session records (theta, asked question IDs, response history).
- This enables reproducibility, auditability, and consistent scoring behavior.

## UI System

- Component architecture organized by surface area:
	- landing
	- assessment
	- dashboard
	- recruiter
	- shared ui primitives
- Theme scaffolding supports consistent typography, spacing, and color tokens across product modules.

## What Makes engineerfit Different

1. Adaptive psychometric evaluation instead of static quiz scoring.
2. Explainable, vector-based job matching instead of opaque ranking.
3. Recruiter and student views built on the same deterministic signal model.
4. End-to-end full-stack TypeScript architecture tuned for rapid iteration.
