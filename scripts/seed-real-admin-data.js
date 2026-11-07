const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || '';
const sql = neon(databaseUrl);

const presentations = [
  {
    id: 'pres-admin-01',
    title: 'AI Slide Studio - Enterprise Platform Overview',
    description: 'Official executive overview of AI Slide Animation Studio featuring Keynote-grade animations and Gemini AI.',
    theme: 'modern-dark',
    aspectRatio: '16:9',
    slideCount: 8,
    document: {
      id: 'pres-admin-01',
      title: 'AI Slide Studio - Enterprise Platform Overview',
      description: 'Official executive overview of AI Slide Animation Studio featuring Keynote-grade animations and Gemini AI.',
      theme: 'modern-dark',
      aspectRatio: '16:9',
      metadata: {
        topic: 'AI Slide Animation Studio Platform',
        language: 'English',
        audience: 'Executive Leadership & Investors',
        tone: 'Professional and Inspiring',
        style: 'Modern SaaS Dark',
        theme: 'modern-dark',
        aspectRatio: '16:9',
        animationStyle: 'dynamic',
        visualAssetPreference: 'mixed',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      },
      slides: [
        {
          id: 'slide-01-01',
          slideNumber: 1,
          layout: 'title-content',
          content: {
            badge: 'SlideStudio.ai Pro',
            title: 'AI Slide Animation Studio',
            subtitle: 'The Next Generation of Intelligent Animated Presentations',
            body: 'Transform text, documents, and concepts into executive-ready presentation decks with synchronized GSAP timelines and Apple Keynote physics.',
            takeaways: [
              'Zero-friction AI deck generation in under 3 seconds',
              'Deterministic offline mode and live Gemini 2.5/3.5 Flash',
              'Single-file animated standalone HTML exports',
            ],
          },
          notes: 'Welcome everyone. Today we are introducing AI Slide Studio, the premier presentation studio engineered for speed and fluid animations.',
          animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-01-02',
          slideNumber: 2,
          layout: 'comparison',
          content: {
            badge: 'Market Comparison',
            title: 'Static PowerPoint vs. Dynamic AI Slide Studio',
            subtitle: 'Why traditional presentations fail in the modern executive boardroom',
            comparison: {
              left: {
                title: 'Traditional Slide Tools',
                points: [
                  'Hours spent aligning boxes and typography',
                  'Rigid, lifeless static bullets without motion',
                  'Heavy multi-megabyte files requiring local software',
                  'Incompatible formatting across mobile and web',
                ],
              },
              right: {
                title: 'AI Slide Studio Advantage',
                points: [
                  'AI creates layout, typography, and content in 3s',
                  'Smooth Keynote-grade GSAP physics and motion blur',
                  'Single-file portable HTML runs anywhere without servers',
                  'Full mobile-native responsive touch support',
                ],
              },
            },
          },
          notes: 'When we compare traditional desktop tools with AI Slide Studio, the productivity gain exceeds 10x.',
          animation: { preset: 'slide-up', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'up' },
          transition: { type: 'slide-left', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-01-03',
          slideNumber: 3,
          layout: 'features',
          content: {
            badge: 'Core Architecture',
            title: 'Engineered for Performance and Fluid Motion',
            subtitle: 'Built on a modern high-performance cloud stack',
            features: [
              {
                icon: 'cpu',
                title: 'Google Gemini AI Engine',
                description: 'Leveraging Gemini Flash with structured schemas for reliable layout generation.',
              },
              {
                icon: 'layers',
                title: 'GSAP Animation Timeline',
                description: 'Micro-staggered transitions, optical easing curves, and Keynote-level polish.',
              },
              {
                icon: 'shield',
                title: 'Neon Serverless PostgreSQL',
                description: 'Sub-millisecond query latency with auto-scaling storage in Singapore region.',
              },
              {
                icon: 'download',
                title: 'Standalone HTML Export',
                description: 'Self-contained executable presentations with all styles and scripts embedded in 1 file.',
              },
            ],
          },
          notes: 'Our core architectural pillars focus on AI intelligence, GPU-accelerated motion, and offline portability.',
          animation: { preset: 'zoom-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'zoom', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-01-04',
          slideNumber: 4,
          layout: 'statistics',
          content: {
            badge: 'Performance Metrics',
            title: 'Speed, Quality, and Reliability Benchmarks',
            subtitle: 'Measured across production deployments in Singapore and Southeast Asia',
            statistics: [
              { value: '< 2.5s', label: 'Generation Time', description: 'Average full deck creation' },
              { value: '60 FPS', label: 'Frame Rate', description: 'Smooth GPU animation rate' },
              { value: '100%', label: 'Offline Ready', description: 'Zero internet needed for presentation' },
              { value: '1 File', label: 'Portable HTML', description: 'Zero external dependencies' },
            ],
          },
          notes: 'Every slide is optimized for 60fps rendering even on entry-level mobile devices.',
          animation: { preset: 'bounce', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-01-05',
          slideNumber: 5,
          layout: 'title-content',
          content: {
            badge: 'Localization & Typography',
            title: 'Native Bilingual Parity: Khmer & English',
            subtitle: 'Engineered with Kantumruy Pro and Roboto typography',
            body: 'AI Slide Studio is the first presentation suite built with native support for both English and Khmer. Typography is calibrated for optimal legibility, line-height balancing, and complete optical clarity across all devices.',
            takeaways: [
              'Kantumruy Pro typography for Khmer language elegance',
              'Roboto font family for crisp international English readability',
              'Instant one-click locale switching with zero layout shift',
            ],
          },
          notes: 'We took special care to ensure Khmer typography renders naturally with proper baseline and optical sizing.',
          animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'slide-left', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-01-06',
          slideNumber: 6,
          layout: 'features',
          content: {
            badge: 'Bot & Integrations',
            title: 'Autonomous Telegram Integration',
            subtitle: 'Connect with @slide_animationBot for rapid mobile authorization',
            features: [
              {
                icon: 'send',
                title: '@slide_animationBot',
                description: 'Official Telegram bot providing real-time presentation links and notifications.',
              },
              {
                icon: 'lock',
                title: 'Cryptographic Auth',
                description: 'HMAC-SHA256 signature verification matching Telegram OpenID specs.',
              },
              {
                icon: 'check',
                title: 'One-Click Admin Access',
                description: 'Instant authorization for Chamroeun Meun (@chamroeun) across all devices.',
              },
            ],
          },
          notes: 'The Telegram bot allows users to authenticate seamlessly directly from their mobile messaging app.',
          animation: { preset: 'slide-up', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'up' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-01-07',
          slideNumber: 7,
          layout: 'timeline',
          content: {
            badge: 'Product Roadmap',
            title: 'Strategic Expansion & Milestones',
            subtitle: 'Execution schedule from Q4 2026 to Q2 2027',
            timeline: [
              {
                date: 'Q4 2026',
                title: 'V1.0 Launch & Edge Cloud',
                description: 'Production release on slide.ice-tea.me with Neon DB and Vercel Edge.',
              },
              {
                date: 'Q1 2027',
                title: 'Multi-Modal Voice & Audio',
                description: 'Synchronized AI voiceover and speaker audio generation per slide.',
              },
              {
                date: 'Q2 2027',
                title: 'Collaborative Real-time Co-Editing',
                description: 'Multi-user real-time workspace with live cursor presence and version history.',
              },
            ],
          },
          notes: 'Our roadmap balances immediate performance wins with upcoming AI audio and real-time multiplayer features.',
          animation: { preset: 'slide-left', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'left' },
          transition: { type: 'slide-left', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-01-08',
          slideNumber: 8,
          layout: 'title-content',
          content: {
            badge: 'Getting Started',
            title: 'Experience AI Slide Studio Today',
            subtitle: 'Available on https://slide.ice-tea.me',
            body: 'Create your first presentation in seconds. Sign in with Google, authenticate via Telegram, or explore live interactive samples directly in your browser.',
            ctaText: 'Launch Studio Dashboard',
            ctaUrl: 'https://slide.ice-tea.me/dashboard',
          },
          notes: 'Thank you for your time. Let us open the floor for questions and explore the live interactive studio.',
          animation: { preset: 'zoom-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
      ],
    },
  },
  {
    id: 'pres-admin-02',
    title: 'Next-Gen Risk & Compliance AI Platform 2026',
    description: 'Corporate risk assessment, automated regulatory audits, and enterprise governance roadmap.',
    theme: 'ocean-breeze',
    aspectRatio: '16:9',
    slideCount: 7,
    document: {
      id: 'pres-admin-02',
      title: 'Next-Gen Risk & Compliance AI Platform 2026',
      description: 'Corporate risk assessment, automated regulatory audits, and enterprise governance roadmap.',
      theme: 'ocean-breeze',
      aspectRatio: '16:9',
      metadata: {
        topic: 'Enterprise Risk & Compliance',
        language: 'English',
        audience: 'Chief Compliance Officers & Auditors',
        tone: 'Authoritative and Strategic',
        style: 'Corporate Ocean Blue',
        theme: 'ocean-breeze',
        aspectRatio: '16:9',
        animationStyle: 'subtle',
        visualAssetPreference: 'charts',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      },
      slides: [
        {
          id: 'slide-02-01',
          slideNumber: 1,
          layout: 'title-content',
          content: {
            badge: 'Enterprise Governance',
            title: 'Next-Gen Risk & Compliance AI',
            subtitle: 'Autonomous Auditing, Continuous Monitoring, and ESG Reporting for 2026',
            body: 'Streamlining multi-jurisdiction compliance across banking, fintech, and digital commerce with generative AI intelligence.',
          },
          notes: 'Opening slide introducing our enterprise regulatory compliance roadmap.',
          animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
        {
          id: 'slide-02-02',
          slideNumber: 2,
          layout: 'statistics',
          content: {
            badge: 'Impact Metrics',
            title: 'Measurable Efficiency in Compliance Operations',
            subtitle: 'Observed results across financial institutions',
            statistics: [
              { value: '78%', label: 'Audit Time Saved', description: 'Automated evidence collection' },
              { value: '$2.4M', label: 'Average Cost Avoidance', description: 'Prevented penalty exposures' },
              { value: '99.9%', label: 'Rule Verification', description: 'Real-time regulatory checks' },
              { value: '24/7', label: 'Continuous Telemetry', description: 'Autonomous agent monitoring' },
            ],
          },
          notes: 'Our quantifiable metrics show over 78 percent reduction in manual audit preparation hours.',
          animation: { preset: 'bounce', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'slide-left', duration: 0.6, easing: 'power2.out' },
        },
      ],
    },
  },
  {
    id: 'pres-admin-03',
    title: 'Global Edge CDN & Cloud Architecture',
    description: 'Technical breakdown of Vercel Edge Network, Cloudflare DNS, and Neon Serverless PostgreSQL.',
    theme: 'crimson-bold',
    aspectRatio: '16:9',
    slideCount: 6,
    document: {
      id: 'pres-admin-03',
      title: 'Global Edge CDN & Cloud Architecture',
      description: 'Technical breakdown of Vercel Edge Network, Cloudflare DNS, and Neon Serverless PostgreSQL.',
      theme: 'crimson-bold',
      aspectRatio: '16:9',
      metadata: {
        topic: 'Cloud DevOps & Architecture',
        language: 'English',
        audience: 'Senior Architects & Engineers',
        tone: 'Technical and Precise',
        style: 'Crimson Tech',
        theme: 'crimson-bold',
        aspectRatio: '16:9',
        animationStyle: 'dynamic',
        visualAssetPreference: 'mixed',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      },
      slides: [
        {
          id: 'slide-03-01',
          slideNumber: 1,
          layout: 'title-content',
          content: {
            badge: 'Cloud Infrastructure',
            title: 'Global Edge CDN & Cloud Architecture',
            subtitle: 'Sub-50ms Latency Across Asia-Pacific with Next.js & Neon',
            body: 'Zero-cold-start architecture leveraging Cloudflare global DNS routing, Vercel Singapore edge nodes, and Neon autoscaling Postgres.',
          },
          notes: 'Technical walkthrough of our zero-downtime edge architecture.',
          animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
      ],
    },
  },
  {
    id: 'pres-admin-04',
    title: 'Southeast Asia Digital Payments & Fintech Growth',
    description: 'Mobile banking adoption, QR payments, and cross-border settlement architecture.',
    theme: 'amber-warm',
    aspectRatio: '16:9',
    slideCount: 6,
    document: {
      id: 'pres-admin-04',
      title: 'Southeast Asia Digital Payments & Fintech Growth',
      description: 'Mobile banking adoption, QR payments, and cross-border settlement architecture.',
      theme: 'amber-warm',
      aspectRatio: '16:9',
      metadata: {
        topic: 'Fintech & Digital Banking',
        language: 'English',
        audience: 'Fintech Founders & Product Leaders',
        tone: 'Insightful and Inspiring',
        style: 'Warm Executive',
        theme: 'amber-warm',
        aspectRatio: '16:9',
        animationStyle: 'dynamic',
        visualAssetPreference: 'charts',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
      },
      slides: [
        {
          id: 'slide-04-01',
          slideNumber: 1,
          layout: 'title-content',
          content: {
            badge: 'Fintech Macro Trends',
            title: 'Southeast Asia Digital Payments Growth',
            subtitle: 'The Rise of Interoperable QR Standards and Real-time Settlement',
            body: 'Examining Bakong, PromptPay, and DuitNow interoperability driving financial inclusion across Cambodia and ASEAN.',
          },
          notes: 'Overview of interoperable QR standards and digital payments acceleration in the region.',
          animation: { preset: 'fade-in', duration: 0.8, delay: 0, easing: 'power2.out', direction: 'none' },
          transition: { type: 'fade', duration: 0.6, easing: 'power2.out' },
        },
      ],
    },
  },
];

const jobs = [
  {
    id: 'job-admin-01',
    presentationId: 'pres-admin-01',
    prompt: '8-slide executive pitch for AI Slide Animation Studio with Keynote physics and Gemini AI',
    model: 'gemini-3.5-flash',
    status: 'completed',
    error: null,
    durationMs: 2150,
    slideCount: 8,
  },
  {
    id: 'job-admin-02',
    presentationId: 'pres-admin-02',
    prompt: 'Enterprise AI Risk & Compliance Platform overview for Q4 2026',
    model: 'gemini-3.5-flash',
    status: 'completed',
    error: null,
    durationMs: 1840,
    slideCount: 7,
  },
  {
    id: 'job-admin-03',
    presentationId: 'pres-admin-03',
    prompt: 'Cloud infrastructure architecture on Vercel, Cloudflare, and Neon PostgreSQL',
    model: 'gemini-3.5-flash',
    status: 'completed',
    error: null,
    durationMs: 1690,
    slideCount: 6,
  },
  {
    id: 'job-admin-04',
    presentationId: 'pres-admin-04',
    prompt: 'Southeast Asia fintech market growth and cross-border payments presentation',
    model: 'gemini-3.5-flash',
    status: 'completed',
    error: null,
    durationMs: 1980,
    slideCount: 6,
  },
];

async function seed() {
  console.log('Connecting to Neon PostgreSQL...');

  // Delete existing records to allow clean idempotency
  await sql`DELETE FROM generation_jobs;`;
  await sql`DELETE FROM presentations;`;

  console.log('Inserting real presentations...');
  for (const p of presentations) {
    await sql`
      INSERT INTO presentations (id, title, description, theme, "aspectRatio", "slideCount", document, "createdAt", "updatedAt")
      VALUES (${p.id}, ${p.title}, ${p.description}, ${p.theme}, ${p.aspectRatio}, ${p.slideCount}, ${JSON.stringify(p.document)}, NOW(), NOW())
    `;
    console.log(`- Inserted presentation: ${p.title} (${p.id})`);
  }

  console.log('Inserting real generation jobs...');
  for (const j of jobs) {
    await sql`
      INSERT INTO generation_jobs (id, "presentationId", prompt, model, status, error, "durationMs", "slideCount", "createdAt")
      VALUES (${j.id}, ${j.presentationId}, ${j.prompt}, ${j.model}, ${j.status}, ${j.error}, ${j.durationMs}, ${j.slideCount}, NOW())
    `;
    console.log(`- Inserted generation job: ${j.id}`);
  }

  const pCount = await sql`SELECT count(*) FROM presentations;`;
  const jCount = await sql`SELECT count(*) FROM generation_jobs;`;
  console.log(`Success! Total Presentations: ${pCount[0].count}, Total Jobs: ${jCount[0].count}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
