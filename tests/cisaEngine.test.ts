import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DOMAINS,
  STORAGE_KEY,
  buildWeakAreaMarkdown,
  buildWeightedExamSet,
  calculateResidualRisk,
  computeDomainStats,
  computeReadinessIndex,
  estimateCisaScaledScore,
  formatTime,
  getWeakDomainIds,
  loadStudyProgress,
  parseStudyProgress,
  saveStudyProgress,
  shuffleQuestionOptions,
  type QuizAttempt,
  type QuizQuestion,
} from '../src/lib/cisaEngine.ts';

function makeBank(): QuizQuestion[] {
  const bank: QuizQuestion[] = [];
  let id = 1;
  for (const domain of DOMAINS) {
    for (let i = 0; i < 20; i += 1) {
      bank.push({
        id: id++,
        domain: domain.id,
        question: `Domain ${domain.id} Question ${i + 1}`,
        options: [`Correct D${domain.id}-${i}`, `Wrong A`, `Wrong B`, `Wrong C`],
        answer: 0,
        explanation: `Explanation for D${domain.id}-${i}`,
      });
    }
  }
  return bank;
}

function deterministicRng(seed = 42): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

test('official CISA domain weights sum to 100%', () => {
  const sum = DOMAINS.reduce((acc, d) => acc + d.weight, 0);
  assert.equal(sum, 100);
  assert.equal(DOMAINS.length, 5);
});

test('formatTime formats minutes and zero-padded seconds safely', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(-10), '0:00');
});

test('estimateCisaScaledScore maps 0-100% into 200-800 ISACA scale with 450 pass threshold', () => {
  assert.deepEqual(estimateCisaScaledScore(0), { scaled: 200, passing: false, band: 'Building Foundation' });
  assert.deepEqual(estimateCisaScaledScore(42), { scaled: 452, passing: true, band: 'Borderline' });
  assert.deepEqual(estimateCisaScaledScore(75), { scaled: 650, passing: true, band: 'Exam Ready' });
  assert.equal(estimateCisaScaledScore(150).scaled, 800);
});

test('shuffleQuestionOptions preserves correct option text and redistributes positions', () => {
  const rng = deterministicRng(7);
  const original: QuizQuestion = {
    id: 99,
    domain: 1,
    question: 'Sample question',
    options: ['Right Answer', 'Distractor 1', 'Distractor 2', 'Distractor 3'],
    answer: 0,
    explanation: 'Why right answer is right',
  };

  const positions = new Set<number>();
  for (let i = 0; i < 30; i += 1) {
    const shuffled = shuffleQuestionOptions(original, rng);
    assert.equal(shuffled.options[shuffled.answer], 'Right Answer');
    positions.add(shuffled.answer);
  }
  assert.ok(positions.size >= 3, 'Shuffled answers should span multiple positions');
});

test('buildWeightedExamSet supports weighted, weak-domain, and single-domain filters', () => {
  const bank = makeBank();
  const rng = deterministicRng(1337);

  const weighted = buildWeightedExamSet(bank, 50, 'all', [5, 4], rng);
  assert.equal(weighted.length, 50);
  const d5Count = weighted.filter((q) => q.domain === 5).length;
  const d3Count = weighted.filter((q) => q.domain === 3).length;
  assert.ok(d5Count > d3Count, `Domain 5 (${d5Count}) should have more questions than Domain 3 (${d3Count})`);

  const weakOnly = buildWeightedExamSet(bank, 20, 'weak', [2, 3], rng);
  assert.equal(weakOnly.length, 20);
  assert.ok(weakOnly.every((q) => q.domain === 2 || q.domain === 3));

  const singleDomain = buildWeightedExamSet(bank, 15, 4, [5, 4], rng);
  assert.equal(singleDomain.length, 15);
  assert.ok(singleDomain.every((q) => q.domain === 4));
});

test('computeDomainStats & getWeakDomainIds rank highest weighted gaps first', () => {
  const attempts: QuizAttempt[] = [
    {
      score: 6,
      total: 10,
      durationSeconds: 300,
      completedAt: '2026-11-24T00:00:00.000Z',
      perDomain: {
        1: { correct: 2, total: 2 },
        2: { correct: 2, total: 2 },
        3: { correct: 2, total: 2 },
        4: { correct: 0, total: 2 },
        5: { correct: 0, total: 2 },
      },
    },
  ];
  const stats = computeDomainStats(attempts);
  const weakest = getWeakDomainIds(stats, 2);
  assert.deepEqual(weakest, [5, 4]);
});

test('computeReadinessIndex stays within 0-100 and rewards full mastery', () => {
  assert.equal(
    computeReadinessIndex({
      masteredCount: 0,
      totalCards: 18,
      averageQuiz: 0,
      attemptCount: 0,
      completedDaysCount: 0,
      totalDays: 30,
    }),
    0,
  );
  assert.equal(
    computeReadinessIndex({
      masteredCount: 18,
      totalCards: 18,
      averageQuiz: 100,
      attemptCount: 5,
      completedDaysCount: 30,
      totalDays: 30,
    }),
    100,
  );
});

test('calculateResidualRisk computes inherent, residual, and priority tier', () => {
  assert.deepEqual(calculateResidualRisk(5, 5, 1), {
    inherentRisk: 25,
    residualRisk: 25,
    priority: 'High',
  });
  assert.deepEqual(calculateResidualRisk(3, 3, 5), {
    inherentRisk: 9,
    residualRisk: 2,
    priority: 'Low',
  });
});

test('localStorage persistence round-trips cleanly and recovers from corrupt JSON', () => {
  const mem = new Map<string, string>();
  const fakeStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
  };

  saveStudyProgress(
    {
      version: 1,
      masteredIds: [1, 2, 2, 5],
      reviewQueueIds: [3],
      attempts: [
        {
          score: 8,
          total: 10,
          durationSeconds: 180,
          completedAt: '2026-11-24T12:00:00.000Z',
          perDomain: { 5: { correct: 4, total: 5 }, 4: { correct: 4, total: 5 } },
        },
      ],
      completedDays: [1, 2],
      blockCompletion: { 1: [true, true, true, true] },
      updatedAt: '2026-11-24T12:00:00.000Z',
    },
    fakeStorage,
  );

  assert.ok(mem.has(STORAGE_KEY));
  const loaded = loadStudyProgress(fakeStorage);
  assert.deepEqual(loaded.masteredIds, [1, 2, 5]);
  assert.deepEqual(loaded.completedDays, [1, 2]);
  assert.deepEqual(loaded.blockCompletion[1], [true, true, true, true]);

  const corrupt = parseStudyProgress('{not-valid-json');
  assert.deepEqual(corrupt.masteredIds, []);
  assert.deepEqual(corrupt.attempts, []);
});

test('buildWeakAreaMarkdown produces structured study sheet with missed questions', () => {
  const stats = computeDomainStats([]);
  const md = buildWeakAreaMarkdown({
    readinessScore: 64,
    averageQuiz: 72,
    masteredCount: 10,
    totalCards: 18,
    completedDaysCount: 8,
    domainStats: stats,
    recentMissedQuestions: [
      {
        id: 4,
        domain: 4,
        question: 'If MTD is 20 hours and RTO is 8 hours, what is max WRT?',
        options: ['12 hours', '8 hours', '20 hours', '28 hours'],
        answer: 0,
        explanation: 'MTD = RTO + WRT, so WRT = 12 hours.',
      },
    ],
  });
  assert.match(md, /CISA GRC Study Portal/);
  assert.match(md, /Domain 5: Protection of Information Assets/);
  assert.match(md, /12 hours/);
});
