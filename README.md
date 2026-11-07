# AI Slide Animation Studio

AI Slide Animation Studio is a full-stack, enterprise-grade web application that converts natural language prompts and structured outlines into animated, boardroom-ready presentations. 

Featuring Google Gemini GenAI integration, custom layout synthesis, hardware-accelerated GSAP animations, a 3-panel slide editor, fullscreen presentation player, and zero-dependency standalone HTML export.

---

## Architectural Highlights

- **Frontend (`apps/web`):** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Radix UI, Lucide React icons, GSAP 3 timeline orchestration, responsive stage fit-scaling (`1920x1080` and `1440x1080`).
- **Backend (`apps/api`):** NestJS 11, Prisma ORM, PostgreSQL persistence (`ai_slide_studio`), official Google Gen AI SDK (`@google/genai`), server-side rate limiting, structured schema validation, deterministic fallback generator.
- **Shared Package (`packages/shared`):** Zod validation schemas, TypeScript interfaces, curated design themes, animation registry, slide layouts.
- **Offline HTML Export System:** Self-contained single-file HTML exporter that bundles complete CSS variables, responsive fit-scale calculations, SVG path icons, GSAP-powered motion transitions, numeric counter animations, and presentation controls into an independent HTML file that runs in any browser with zero backend requirements.
- **Strict Design Standards:** 100% emoji-free UI and presentation decks. Strictly professional geometric SVG iconography (Lucide React) and modern dark SaaS aesthetic.

---

## Monorepo Structure

```
ai-slide-animation-studio/
├── apps/
│   ├── web/                          # Next.js 15 Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router (Dashboard, Editor, Presenter, Settings, Templates)
│   │   │   ├── components/
│   │   │   │   ├── dashboard/        # PromptHero, RecentPresentations, QuickTemplates
│   │   │   │   ├── editor/           # EditorToolbar, ThumbnailList, SlideCanvas, PropertyPanel
│   │   │   │   ├── generator/        # PromptGeneratorModal with real progress states
│   │   │   │   ├── navigation/       # Sidebar, Header
│   │   │   │   ├── player/           # Fullscreen PresentationPlayer with autoplay
│   │   │   │   ├── slides/           # SlideRenderer (12 Layouts, GSAP hooks)
│   │   │   │   └── ui/               # Radix UI + Tailwind CSS components
│   │   │   ├── hooks/                # useEditorStore, useFitScale, useGSAPAnimation
│   │   │   ├── services/             # Type-safe API Client
│   │   │   └── styles/               # globals.css with dark SaaS palette
│   │   ├── test/                     # Playwright E2E Test Suite
│   │   └── playwright.config.ts      # Playwright Chrome configuration
│   └── api/                          # NestJS 11 Backend API
│       ├── prisma/                   # Prisma schema and PostgreSQL migrations
│       ├── src/
│       │   ├── common/               # Filters, interceptors, rate limiting
│       │   ├── config/               # Environment configuration
│       │   ├── database/             # PrismaService and connection lifecycle
│       │   ├── export/               # Standalone single-file HTML & JSON exporter
│       │   ├── gemini/               # Official @google/genai SDK & structured fallback
│       │   ├── generation/           # Generation service and controllers
│       │   ├── health/               # Health check and telemetry
│       │   └── presentations/        # Presentations CRUD and duplication
│       └── test/                     # Supertest Integration Tests (10 tests)
├── packages/
│   └── shared/                       # Shared Workspace Package
│       └── src/
│           ├── constants/            # Themes, layouts, animation registry
│           ├── schemas/              # Zod validation schemas
│           └── types/                # TypeScript type definitions
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## Supported Slide Layouts & Themes

### 12 Production Slide Layouts
1. **Cover Slide:** Keynote title, subtitle, executive category badge.
2. **Title & Content:** Lead text, paragraph body, structured bullet points.
3. **Two Columns:** Parallel comparative columns for multi-faceted analysis.
4. **Image & Text:** Visual prompt integration with accompanying strategic copy.
5. **Executive Quote:** Stylized pull-quotes with author attribution and roles.
6. **Statistics & Metrics:** Numeric metrics, percentage indicators, trend badges, counters.
7. **Timeline Milestones:** Chronological phase progression with status indicators.
8. **Comparison Grid:** Side-by-side legacy vs. modern feature analysis with recommendation highlights.
9. **Key Takeaways:** Executive summary cards with numbered indicators.
10. **Closing & Contact:** Keynote summary, primary call-to-action button, contact endpoints.
11. **Feature Grid:** 3-column architecture cards with geometric Lucide icons.
12. **Metric Highlight:** High-impact hero metric card with trend analysis.

### 6 Curated Themes
- **Modern Dark:** Deep charcoal (`#0B0A1A`) with electric violet and cyan accents.
- **Minimal Light:** Crisp white canvas (`#FFFFFF`) with slate neutral typography.
- **Corporate Blue:** Deep navy (`#071226`) with sky blue and royal highlights.
- **Editorial Warm:** Rich espresso (`#151210`) with warm amber and bronze accents.
- **Technology Gradient:** Cyber carbon (`#060B14`) with vivid cyan and emerald telemetry.
- **Elegant Monochrome:** Pitch black (`#050505`) with silver neutral grayscale.

---

## Hardware-Accelerated GSAP Animations

Predefined animation presets with parameter duration, delay, easing, and timeline cleanup:
- `fade-in`, `fade-out`
- `slide-in-left`, `slide-in-right`, `slide-in-up`, `slide-in-down`
- `zoom-in`, `zoom-out`
- `rotate`
- `blur-in`
- `typewriter`
- `stagger-text`
- `reveal`
- `parallax`

Slide transition modes:
- `fade`, `slide`, `zoom`, `none`

---

## Standalone HTML Export System

Modeled directly after single-file presentation standards:
- **Zero Server Dependencies:** Runs directly from local filesystem (`file://`) or any static web host.
- **Viewport Fit Scaling:** Dynamically scales stage dimensions via `Math.min(window.innerWidth / 1920, window.innerHeight / 1080)`.
- **Keyboard Navigation:** Left/Right Arrow, Spacebar, PageUp/PageDown, Home/End, 'F' for fullscreen.
- **Embedded SVG Icon Paths:** Complete geometric icon dictionary embedded in JavaScript.
- **Autoplay Engine:** Configurable interval timer with smooth slide advancement.
- **Live Counter Animation:** Smooth numerical counter interpolation using `requestAnimationFrame`.

---

## Quickstart & Local Setup

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.0.0 (`npm install -g pnpm`)
- PostgreSQL database running locally on port 5432

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd AI-Project
pnpm install
```

### 2. Environment Configuration
Create `.env` in `apps/api/.env`:
```env
PORT=4000
NODE_ENV=development
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://meunchamroeun@localhost:5432/ai_slide_studio?schema=public"
GEMINI_API_KEY="" # Optional: Free Tier API Key (uses deterministic generator if omitted)
GEMINI_MODEL="gemini-2.5-flash"
```

Create `.env.local` in `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 3. Run Database Migrations
```bash
pnpm db:migrate
```

### 4. Build Monorepo
```bash
pnpm build
```

### 5. Launch Development Servers
Run both API (port 4000) and Web (port 3000):
```bash
# Terminal 1: NestJS Backend API
pnpm dev:api

# Terminal 2: Next.js Frontend
pnpm dev:web
```

Access:
- Frontend Dashboard: `http://localhost:3000`
- API Health Endpoint: `http://localhost:4000/api/health`

---

## Automated Verification Suite

### Unit Tests (Vitest)
```bash
pnpm test:unit
```
- `@ai-slide-studio/shared`: 4 tests passed (Zod schema validation, defaults, boundary checking)
- `@ai-slide-studio/api`: 6 tests passed (Gemini offline fallback, HTML exporter, health check)
- `@ai-slide-studio/web`: 13 tests passed (SlideRenderer layouts, useEditorStore undo/redo/slide mutations, prompt input)
**Total: 23 unit tests passed.**

### Integration Tests (Supertest)
```bash
pnpm test:integration
```
Tests complete lifecycle across NestJS, Prisma, and PostgreSQL:
1. Health check returns 200 with database connection
2. Presentation generation with 6 structured slides
3. Presentations list retrieval
4. Presentation document fetch by ID
5. Presentation title and theme update
6. Presentation duplication
7. Standalone offline HTML export
8. Project JSON export
9. Project JSON import
10. Presentation deletion
**Total: 10 integration tests passed.**

### End-to-End Tests (Playwright)
```bash
pnpm test:e2e
```
Runs headless browser verification:
1. Dashboard loads with dark SaaS UI and strict emoji-free guarantee
2. Seamless navigation across Templates and Settings
3. 3-Panel Editor loads, shows thumbnails, canvas, and property tabs
4. Fullscreen Presentation Player renders with keyboard navigation (ArrowRight, Space, ArrowLeft)
5. Offline HTML Export produces standalone single-file document
**Total: 5 E2E tests passed.**

---

## License
MIT License. Built with pair programming assistance.
