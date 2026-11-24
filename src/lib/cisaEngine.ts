export type Domain = {
  id: number;
  title: string;
  weight: number;
  description: string;
  topics: string[];
  examFocus: string;
  commonTrap: string;
  memoryAnchor: string;
};

export type QuizQuestion = {
  id: number;
  domain: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type QuizAttempt = {
  score: number;
  total: number;
  durationSeconds: number;
  completedAt: string;
  perDomain: Record<number, { correct: number; total: number }>;
  missedIds?: number[];
  mode?: 'exam' | 'study';
  filter?: string;
};

export type ExamFocusFilter = 'all' | 'weak' | 1 | 2 | 3 | 4 | 5;

export type StudyProgress = {
  version: 1;
  masteredIds: number[];
  reviewQueueIds: number[];
  attempts: QuizAttempt[];
  completedDays: number[];
  blockCompletion: Record<number, boolean[]>;
  updatedAt: string;
};

export type DomainStat = {
  id: number;
  title: string;
  weight: number;
  correct: number;
  total: number;
  accuracy: number;
  gap: number;
};

export const STORAGE_KEY = 'cisa_grc_progress_v1';

export const DOMAINS: Domain[] = [
  {
    id: 1,
    title: 'Information System Auditing Process',
    weight: 21,
    description:
      'Plan, execute, and report IS audits using risk-based methods and evidence quality standards.',
    topics: ['Audit charter', 'Risk-based planning', 'Audit evidence', 'Sampling', 'Follow-up'],
    examFocus:
      'Prioritize audit independence, scope clarity, and evidence reliability when options are close.',
    commonTrap:
      'Choosing a technically detailed answer instead of the one that preserves auditor independence.',
    memoryAnchor: 'Authority first, evidence second, detail third.',
  },
  {
    id: 2,
    title: 'Governance and Management of IT',
    weight: 17,
    description:
      'Evaluate leadership, structures, and controls that align IT with business outcomes and risk appetite.',
    topics: ['COBIT governance', 'IT strategy', 'RACI', 'Three lines model', 'Performance metrics'],
    examFocus:
      'Map every governance choice to accountability and business ownership of risk.',
    commonTrap:
      'Assigning IT or audit as risk owner instead of business process owners.',
    memoryAnchor: 'Business owns risk; IT enables; audit assures.',
  },
  {
    id: 3,
    title: 'IS Acquisition, Development and Implementation',
    weight: 12,
    description:
      'Assure controls are designed and tested across project delivery from requirements to post-implementation.',
    topics: ['Business case', 'SDLC controls', 'Project governance', 'Testing strategy', 'PIR'],
    examFocus:
      'Security and controls should appear at requirements and design, not only testing.',
    commonTrap:
      'Selecting late-stage testing as the best point to add key controls.',
    memoryAnchor: 'Shift-left controls beat patch-later controls.',
  },
  {
    id: 4,
    title: 'IS Operations and Business Resilience',
    weight: 23,
    description:
      'Assess operational controls, support processes, and continuity capabilities that sustain service delivery.',
    topics: ['Incident/problem mgmt', 'Capacity and change', 'BIA', 'RTO/RPO/WRT/MTD', 'DR testing'],
    examFocus:
      'In continuity questions, quantify what the business can tolerate before selecting technology.',
    commonTrap:
      'Picking the fastest recovery technology without validating business tolerance metrics.',
    memoryAnchor: 'BIA defines tolerance; DR design follows tolerance.',
  },
  {
    id: 5,
    title: 'Protection of Information Assets',
    weight: 27,
    description:
      'Evaluate design and operation of security controls across identity, data, network, and cryptographic protection.',
    topics: ['IAM models', 'Network controls', 'Crypto and PKI', 'Data classification', 'Physical security'],
    examFocus:
      'Favor least privilege, segmentation, and layered controls tied to CIA impact.',
    commonTrap:
      'Choosing a strong standalone control over the control that best matches risk context.',
    memoryAnchor: 'Classify data, control access, verify integrity, prove recovery.',
  },
];

export function domainById(id: number): Domain {
  return DOMAINS.find((d) => d.id === id) ?? DOMAINS[0];
}

export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = clone[i];
    clone[i] = clone[j];
    clone[j] = temp;
  }
  return clone;
}

export function shuffleQuestionOptions(
  question: QuizQuestion,
  rng: () => number = Math.random,
): QuizQuestion {
  const indexedOptions = question.options.map((option, index) => ({ option, index }));
  const shuffled = shuffleArray(indexedOptions, rng);
  const newAnswer = shuffled.findIndex((item) => item.index === question.answer);
  return {
    ...question,
    options: shuffled.map((item) => item.option),
    answer: newAnswer,
  };
}

/**
 * Unofficial CISA 200-800 scaled score estimator (ISACA passing mark = 450).
 */
export function estimateCisaScaledScore(accuracyPct: number): {
  scaled: number;
  passing: boolean;
  band: 'Exam Ready' | 'Borderline' | 'Building Foundation';
} {
  const clamped = Math.max(0, Math.min(100, accuracyPct));
  const scaled = Math.round(200 + (clamped / 100) * 600);
  const passing = scaled >= 450;
  const band = scaled >= 550 ? 'Exam Ready' : scaled >= 450 ? 'Borderline' : 'Building Foundation';
  return { scaled, passing, band };
}

export function computeDomainStats(attempts: QuizAttempt[]): DomainStat[] {
  const aggregate: Record<number, { correct: number; total: number }> = {};
  attempts.forEach((attempt) => {
    Object.entries(attempt.perDomain || {}).forEach(([id, stats]) => {
      const domainId = Number(id);
      const base = aggregate[domainId] ?? { correct: 0, total: 0 };
      base.correct += stats.correct;
      base.total += stats.total;
      aggregate[domainId] = base;
    });
  });

  return DOMAINS.map((domain) => {
    const stats = aggregate[domain.id] ?? { correct: 0, total: 0 };
    const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    const gap = Math.round((domain.weight / 100) * (100 - accuracy));
    return {
      id: domain.id,
      title: domain.title,
      weight: domain.weight,
      correct: stats.correct,
      total: stats.total,
      accuracy,
      gap,
    };
  });
}

export function getWeakDomainIds(domainStats: DomainStat[], count = 2): number[] {
  return [...domainStats]
    .sort((a, b) => b.gap - a.gap || a.accuracy - b.accuracy)
    .slice(0, count)
    .map((d) => d.id);
}

export function computeReadinessIndex(params: {
  masteredCount: number;
  totalCards: number;
  averageQuiz: number;
  attemptCount: number;
  completedDaysCount: number;
  totalDays: number;
}): number {
  const masteryPct = params.totalCards > 0 ? (params.masteredCount / params.totalCards) * 100 : 0;
  const planPct = params.totalDays > 0 ? (params.completedDaysCount / params.totalDays) * 100 : 0;
  const consistencyPct = Math.min(100, params.attemptCount * 20);
  const score =
    masteryPct * 0.35 +
    params.averageQuiz * 0.45 +
    planPct * 0.1 +
    consistencyPct * 0.1;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildWeightedExamSet(
  questionBank: QuizQuestion[],
  questionCount: number,
  focus: ExamFocusFilter = 'all',
  weakDomainIds: number[] = [5, 4],
  rng: () => number = Math.random,
): QuizQuestion[] {
  const targetCount = Math.max(1, Math.min(questionCount, questionBank.length));

  if (typeof focus === 'number') {
    const pool = shuffleArray(
      questionBank.filter((q) => q.domain === focus),
      rng,
    );
    return pool.slice(0, Math.min(targetCount, pool.length)).map((q) => shuffleQuestionOptions(q, rng));
  }

  if (focus === 'weak') {
    const activeWeak = weakDomainIds.length > 0 ? weakDomainIds : [5, 4];
    const weakPool = shuffleArray(
      questionBank.filter((q) => activeWeak.includes(q.domain)),
      rng,
    );
    const otherPool = shuffleArray(
      questionBank.filter((q) => !activeWeak.includes(q.domain)),
      rng,
    );
    const combined = [...weakPool, ...otherPool].slice(0, targetCount);
    return shuffleArray(combined, rng).map((q) => shuffleQuestionOptions(q, rng));
  }

  // Official CISA weighted allocation across all 5 domains
  const buckets = new Map<number, QuizQuestion[]>();
  DOMAINS.forEach((d) => {
    buckets.set(
      d.id,
      shuffleArray(
        questionBank.filter((q) => q.domain === d.id),
        rng,
      ),
    );
  });

  const picked: QuizQuestion[] = [];
  const usedIds = new Set<number>();

  DOMAINS.forEach((d) => {
    const quota = Math.round((targetCount * d.weight) / 100);
    const pool = buckets.get(d.id) ?? [];
    for (let i = 0; i < Math.min(quota, pool.length); i += 1) {
      picked.push(pool[i]);
      usedIds.add(pool[i].id);
    }
  });

  // Top up or trim to hit exact targetCount
  if (picked.length < targetCount) {
    const remaining = shuffleArray(
      questionBank.filter((q) => !usedIds.has(q.id)),
      rng,
    );
    for (const q of remaining) {
      if (picked.length >= targetCount) break;
      picked.push(q);
      usedIds.add(q.id);
    }
  } else if (picked.length > targetCount) {
    picked.length = targetCount;
  }

  return shuffleArray(picked, rng).map((q) => shuffleQuestionOptions(q, rng));
}

export function calculateResidualRisk(
  impact: number,
  likelihood: number,
  controlMaturity: number,
): { inherentRisk: number; residualRisk: number; priority: 'High' | 'Medium' | 'Low' } {
  const inherentRisk = impact * likelihood;
  const residualRisk = Math.max(1, Math.round((inherentRisk * (6 - controlMaturity)) / 5));
  const priority = residualRisk >= 12 ? 'High' : residualRisk >= 7 ? 'Medium' : 'Low';
  return { inherentRisk, residualRisk, priority };
}

export function createEmptyProgress(): StudyProgress {
  return {
    version: 1,
    masteredIds: [],
    reviewQueueIds: [],
    attempts: [],
    completedDays: [],
    blockCompletion: {},
    updatedAt: new Date().toISOString(),
  };
}

export function parseStudyProgress(raw: string | null): StudyProgress {
  if (!raw) return createEmptyProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<StudyProgress>;
    if (!parsed || typeof parsed !== 'object') return createEmptyProgress();

    const masteredIds = Array.isArray(parsed.masteredIds)
      ? parsed.masteredIds.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
      : [];
    const reviewQueueIds = Array.isArray(parsed.reviewQueueIds)
      ? parsed.reviewQueueIds.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
      : [];
    const completedDays = Array.isArray(parsed.completedDays)
      ? parsed.completedDays.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 30)
      : [];
    const attempts = Array.isArray(parsed.attempts)
      ? parsed.attempts.filter(
          (a): a is QuizAttempt =>
            Boolean(a) &&
            typeof a.score === 'number' &&
            typeof a.total === 'number' &&
            a.total > 0 &&
            typeof a.durationSeconds === 'number' &&
            typeof a.completedAt === 'string' &&
            typeof a.perDomain === 'object',
        )
      : [];

    const blockCompletion: Record<number, boolean[]> = {};
    if (parsed.blockCompletion && typeof parsed.blockCompletion === 'object') {
      Object.entries(parsed.blockCompletion).forEach(([k, v]) => {
        const day = Number(k);
        if (Number.isInteger(day) && day >= 1 && day <= 30 && Array.isArray(v) && v.length === 4) {
          blockCompletion[day] = v.map(Boolean);
        }
      });
    }

    return {
      version: 1,
      masteredIds: Array.from(new Set(masteredIds)),
      reviewQueueIds: Array.from(new Set(reviewQueueIds)),
      attempts,
      completedDays: Array.from(new Set(completedDays)),
      blockCompletion,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return createEmptyProgress();
  }
}

export function loadStudyProgress(storage?: Pick<Storage, 'getItem'>): StudyProgress {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return createEmptyProgress();
  return parseStudyProgress(store.getItem(STORAGE_KEY));
}

export function saveStudyProgress(
  progress: StudyProgress,
  storage?: Pick<Storage, 'setItem'>,
): void {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  try {
    store.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...progress,
        version: 1,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignore storage quota errors in private browsing modes
  }
}

export function buildWeakAreaMarkdown(params: {
  readinessScore: number;
  averageQuiz: number;
  masteredCount: number;
  totalCards: number;
  completedDaysCount: number;
  domainStats: DomainStat[];
  recentMissedQuestions?: QuizQuestion[];
}): string {
  const scaled = estimateCisaScaledScore(params.averageQuiz);
  const sorted = [...params.domainStats].sort((a, b) => b.gap - a.gap);
  const lines: string[] = [
    '# CISA GRC Study Portal — Weak-Area Action Sheet',
    '',
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Readiness Snapshot',
    `- **Readiness Index**: ${params.readinessScore}%`,
    `- **Average Quiz Score**: ${params.averageQuiz}% (Est. CISA Scaled Score: ${scaled.scaled}/800 · ${scaled.band})`,
    `- **Flashcards Mastered**: ${params.masteredCount}/${params.totalCards}`,
    `- **30-Day Plan Completed**: ${params.completedDaysCount}/30 days`,
    '',
    '## Priority Domain Focus (Sorted by Weighted Exam Gap)',
  ];

  sorted.forEach((stat) => {
    const meta = domainById(stat.id);
    lines.push(
      `### Domain ${stat.id}: ${stat.title} (${stat.weight}% Exam Weight)`,
      `- **Recorded Accuracy**: ${stat.total > 0 ? `${stat.accuracy}% (${stat.correct}/${stat.total})` : 'Not tested yet'} · **Weighted Gap**: ${stat.gap}%`,
      `- **Exam Focus**: ${meta.examFocus}`,
      `- **Common Trap**: ${meta.commonTrap}`,
      `- **Memory Anchor**: ${meta.memoryAnchor}`,
      '',
    );
  });

  if (params.recentMissedQuestions && params.recentMissedQuestions.length > 0) {
    lines.push('## Missed Questions to Re-Drill');
    params.recentMissedQuestions.slice(0, 15).forEach((q, idx) => {
      lines.push(
        `${idx + 1}. **[Domain ${q.domain}]** ${q.question}`,
        `   - **Correct Answer**: ${q.options[q.answer]}`,
        `   - **Rationale**: ${q.explanation}`,
      );
    });
    lines.push('');
  }

  lines.push('---', 'Source: CISA GRC Study Portal (https://cisa-grc-study-portal.nealfrazier.tech/) · Open-Access GRC Prep');
  return lines.join('\n');
}
