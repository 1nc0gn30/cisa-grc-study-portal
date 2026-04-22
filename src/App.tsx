import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bot,
  BookMarked,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Filter,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquare,
  Moon,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Shuffle,
  Sun,
  Target,
  TrendingUp,
  XCircle,
  XSquare,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type Domain = {
  id: number;
  title: string;
  weight: number;
  description: string;
  topics: string[];
  examFocus: string;
  commonTrap: string;
  memoryAnchor: string;
};

type GlossaryCategory = {
  category: string;
  items: Array<{ term: string; definition: string }>;
};

type Flashcard = {
  id: number;
  domain: number;
  front: string;
  back: string;
};

type QuizQuestion = {
  id: number;
  domain: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type QuizAttempt = {
  score: number;
  total: number;
  durationSeconds: number;
  completedAt: string;
  perDomain: Record<number, { correct: number; total: number }>;
};

type StudyDay = {
  day: number;
  domain: number;
  title: string;
  objective: string;
  drills: string[];
  checkpoint: string;
};

type DomainLearningPack = {
  concepts: string[];
  scenarioPrompt: string;
  scenarioAnswer: string;
  knowledgeChecks: string[];
};

type ThemeMode = 'dark' | 'light';
type ChatProvider = 'openai' | 'gemini' | 'ollama';
type ChatMessage = { role: 'user' | 'assistant'; content: string };

const DOMAINS: Domain[] = [
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

const GLOSSARY: GlossaryCategory[] = [
  {
    category: 'Audit and Assurance Core',
    items: [
      {
        term: 'Continuous Auditing vs Continuous Monitoring',
        definition:
          'Continuous auditing is performed by audit for assurance evidence; continuous monitoring is run by management to operate controls daily.',
      },
      {
        term: 'Attribute vs Variable Sampling',
        definition:
          'Attribute sampling estimates control compliance rates; variable sampling estimates numeric error magnitude.',
      },
      {
        term: 'Control Design vs Operating Effectiveness',
        definition:
          'Design asks if a control could prevent/detect risk; operating effectiveness asks if it actually did over time.',
      },
      {
        term: 'Inherent vs Residual Risk',
        definition:
          'Inherent risk exists before controls. Residual risk remains after controls and drives treatment decisions.',
      },
    ],
  },
  {
    category: 'Governance and GRC Decisions',
    items: [
      {
        term: 'Risk Appetite vs Risk Tolerance',
        definition:
          'Appetite is the broad strategic risk level accepted by leadership. Tolerance is acceptable variance for specific objectives.',
      },
      {
        term: 'RACI',
        definition:
          'Responsible executes work, Accountable owns final decision, Consulted advises, Informed receives updates.',
      },
      {
        term: 'Three Lines Model',
        definition:
          'Operations own risk, risk/compliance oversee, internal audit independently assures.',
      },
      {
        term: 'Governance vs Management in COBIT',
        definition:
          'Governance evaluates/directs/monitors outcomes; management plans/builds/runs/monitors execution.',
      },
    ],
  },
  {
    category: 'Operations, Recovery and Security',
    items: [
      {
        term: 'RTO, RPO, WRT, MTD',
        definition:
          'MTD equals RTO plus WRT. RPO defines tolerated data loss window.',
      },
      {
        term: 'Preventive, Detective, Corrective Controls',
        definition:
          'Preventive blocks, detective alerts, corrective restores after incidents.',
      },
      {
        term: 'MAC, DAC, RBAC',
        definition:
          'MAC is centrally labeled, DAC is owner-discretionary, RBAC is role-permission mapping.',
      },
      {
        term: 'Digital Signature',
        definition:
          'Sender signs hash with private key to provide integrity, authentication, and non-repudiation.',
      },
    ],
  },
];

const FLASHCARDS: Flashcard[] = [
  { id: 1, domain: 1, front: 'Audit Charter', back: 'Defines internal audit authority, scope, and independence level approved by the board or audit committee.' },
  { id: 2, domain: 1, front: 'Most Reliable Evidence', back: 'Independent, written, and directly observed evidence is usually strongest.' },
  { id: 3, domain: 1, front: 'Compliance Testing', back: 'Tests whether controls are operating as prescribed.' },
  { id: 4, domain: 2, front: 'Risk Ownership', back: 'Business process owners own risk; IT and security support treatment.' },
  { id: 5, domain: 2, front: 'Steering Committee Role', back: 'Align IT initiatives to business value, prioritize portfolio, and resolve conflicts.' },
  { id: 6, domain: 2, front: 'Balanced Scorecard', back: 'Tracks strategy through financial, customer, internal process, and learning perspectives.' },
  { id: 7, domain: 3, front: 'Control Timing in SDLC', back: 'Identify controls at requirements/design to prevent expensive rework.' },
  { id: 8, domain: 3, front: 'Post-Implementation Review', back: 'Validates whether solution achieved business case and control objectives.' },
  { id: 9, domain: 3, front: 'UAT Purpose', back: 'Confirms system supports business process needs before production release.' },
  { id: 10, domain: 4, front: 'MTD Formula', back: 'Maximum Tolerable Downtime = RTO + WRT.' },
  { id: 11, domain: 4, front: 'BIA Output', back: 'Prioritized processes, impact over time, and recovery requirements.' },
  { id: 12, domain: 4, front: 'Incident vs Problem', back: 'Incident restores service fast; problem management removes root cause.' },
  { id: 13, domain: 5, front: 'CIA Triad', back: 'Confidentiality, Integrity, Availability guide security control choices.' },
  { id: 14, domain: 5, front: 'Non-Repudiation Mechanism', back: 'Digital signatures using sender private key over message hash.' },
  { id: 15, domain: 5, front: 'CER', back: 'Crossover error rate where FAR and FRR intersect; lower is better.' },
  { id: 16, domain: 5, front: 'Defense in Depth', back: 'Layered preventive, detective, corrective controls across people/process/technology.' },
  { id: 17, domain: 1, front: 'Substantive Testing', back: 'Directly validates data integrity and accuracy, not only control presence.' },
  { id: 18, domain: 4, front: 'Change Enablement', back: 'Ensures changes are assessed, approved, tested, and backout-capable before release.' },
];

const SCENARIO_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    domain: 1,
    question: 'Which audit action BEST preserves independence while validating control operation?',
    options: [
      'Designing a replacement control for management',
      'Reviewing evidence and testing control execution',
      'Approving production access exceptions',
      'Owning risk acceptance decisions',
    ],
    answer: 1,
    explanation: 'Auditors provide independent assurance by testing controls and evidence, not by owning management actions.',
  },
  {
    id: 2,
    domain: 2,
    question: 'What is the strongest indicator of IT-business alignment?',
    options: [
      'All IT projects use agile',
      'IT initiatives map directly to business outcomes',
      'Every system has architecture diagrams',
      'All incidents are closed in SLA',
    ],
    answer: 1,
    explanation: 'Alignment is proven when IT efforts measurably support business objectives, not by process maturity alone.',
  },
  {
    id: 3,
    domain: 3,
    question: 'When should key security controls be first defined in SDLC?',
    options: ['Testing', 'Deployment', 'Requirements/design', 'Post-implementation review'],
    answer: 2,
    explanation: 'Controls should be integrated early to shape architecture and avoid retrofit risk.',
  },
  {
    id: 4,
    domain: 4,
    question: 'If MTD is 20 hours and RTO is 8 hours, what is the maximum WRT?',
    options: ['12 hours', '8 hours', '20 hours', '28 hours'],
    answer: 0,
    explanation: 'MTD = RTO + WRT, so WRT = 20 - 8 = 12 hours.',
  },
  {
    id: 5,
    domain: 5,
    question: 'Which control objective is MOST directly served by a digital signature?',
    options: ['Availability', 'Non-repudiation and integrity', 'Confidentiality only', 'Network segmentation'],
    answer: 1,
    explanation: 'Digital signatures provide integrity verification and non-repudiation of sender intent.',
  },
  {
    id: 6,
    domain: 1,
    question: 'For purchase approvals over a threshold, which sampling method is BEST to estimate compliance rate?',
    options: ['Variable sampling', 'Attribute sampling', 'Discovery sampling', 'Haphazard selection'],
    answer: 1,
    explanation: 'Attribute sampling tests occurrence of a yes/no control attribute.',
  },
  {
    id: 7,
    domain: 2,
    question: 'Who should be accountable for accepting a critical IT risk?',
    options: ['Internal audit', 'CISO only', 'Business process owner', 'External auditor'],
    answer: 2,
    explanation: 'Business leadership owns risk decisions; supporting functions advise and execute.',
  },
  {
    id: 8,
    domain: 3,
    question: 'Primary value of post-implementation review is to:',
    options: [
      'Reopen old requirements debates',
      'Validate delivery against business case and controls',
      'Replace UAT',
      'Eliminate change management',
    ],
    answer: 1,
    explanation: 'PIR confirms intended value and control outcomes were achieved after go-live.',
  },
  {
    id: 9,
    domain: 4,
    question: 'An organization needs RPO of 1 hour. Which option BEST fits?',
    options: ['Monthly full backup', 'Daily full backup', 'Frequent snapshots/CDP', 'Quarterly archival'],
    answer: 2,
    explanation: 'Low RPO requires frequent data capture, often continuous replication/snapshots.',
  },
  {
    id: 10,
    domain: 5,
    question: 'Which model grants access based on job function rather than data owner choice?',
    options: ['DAC', 'RBAC', 'MAC', 'ABAC never'],
    answer: 1,
    explanation: 'RBAC aligns permissions to role definitions tied to job responsibilities.',
  },
  {
    id: 11,
    domain: 1,
    question: 'Which evidence source is typically LEAST reliable?',
    options: ['Independent third-party report', 'System-generated immutable logs', 'Verbal statement without corroboration', 'Direct auditor observation'],
    answer: 2,
    explanation: 'Unsupported verbal claims have low reliability unless corroborated.',
  },
  {
    id: 12,
    domain: 2,
    question: 'A RACI matrix requires which rule to avoid accountability ambiguity?',
    options: ['Multiple Accountable roles per task', 'Exactly one Accountable role per task', 'No Consulted roles', 'Informed roles must approve'],
    answer: 1,
    explanation: 'Single accountability prevents decision deadlock and unclear ownership.',
  },
  {
    id: 13,
    domain: 3,
    question: 'Most effective control for detecting integration defects before production is:',
    options: ['Unit tests only', 'Integration and system testing with traceability', 'Post-release monitoring only', 'UAT without QA'],
    answer: 1,
    explanation: 'Integration/system testing validates end-to-end behavior against requirements.',
  },
  {
    id: 14,
    domain: 4,
    question: 'First step after a major outage to restore business service is typically:',
    options: ['Root cause analysis', 'Service restoration per incident process', 'Policy rewrite', 'Annual audit report'],
    answer: 1,
    explanation: 'Incident management prioritizes restoring service quickly before deeper problem analysis.',
  },
  {
    id: 15,
    domain: 5,
    question: 'Which strategy BEST reflects defense in depth?',
    options: ['Single strong perimeter firewall', 'Layered IAM, network, endpoint, and monitoring controls', 'Encryption without access controls', 'Awareness training only'],
    answer: 1,
    explanation: 'Layering controls across domains reduces single-point control failure risk.',
  },
];

type QuizFact = {
  id: string;
  domain: number;
  concept: string;
  truth: string;
};

const QUIZ_FACTS: QuizFact[] = [
  { id: 'd1-1', domain: 1, concept: 'Audit charter', truth: 'The audit charter should define authority, responsibility, scope, and independence.' },
  { id: 'd1-2', domain: 1, concept: 'Risk-based planning', truth: 'Audit plans should prioritize high-impact and high-likelihood risk areas first.' },
  { id: 'd1-3', domain: 1, concept: 'Evidence hierarchy', truth: 'Independent documentary evidence is generally stronger than uncorroborated verbal evidence.' },
  { id: 'd1-4', domain: 1, concept: 'Sampling type', truth: 'Attribute sampling is used to estimate control compliance rates.' },
  { id: 'd1-5', domain: 1, concept: 'Substantive testing', truth: 'Substantive testing validates data accuracy and integrity, not only control presence.' },
  { id: 'd1-6', domain: 1, concept: 'Segregation of duties', truth: 'Segregation of duties reduces fraud and error by separating incompatible responsibilities.' },
  { id: 'd1-7', domain: 1, concept: 'Follow-up', truth: 'Follow-up validates that remediation actions are implemented and operating effectively.' },
  { id: 'd1-8', domain: 1, concept: 'Control design', truth: 'Control design testing asks whether a control could prevent or detect the stated risk.' },
  { id: 'd1-9', domain: 1, concept: 'Operating effectiveness', truth: 'Operating effectiveness evaluates whether controls worked consistently over time.' },
  { id: 'd1-10', domain: 1, concept: 'Audit evidence sufficiency', truth: 'Sufficient evidence must support the finding so conclusions are defensible.' },
  { id: 'd1-11', domain: 1, concept: 'Independence risk', truth: 'Auditors should avoid owning or approving operational decisions they later assess.' },
  { id: 'd1-12', domain: 1, concept: 'Reporting quality', truth: 'Findings are strongest when condition, criteria, cause, effect, and recommendation are clear.' },

  { id: 'd2-1', domain: 2, concept: 'Governance ownership', truth: 'Business management remains accountable for accepting and owning business risk.' },
  { id: 'd2-2', domain: 2, concept: 'COBIT split', truth: 'Governance evaluates, directs, and monitors while management plans, builds, and runs.' },
  { id: 'd2-3', domain: 2, concept: 'Alignment indicator', truth: 'IT-business alignment is strongest when IT initiatives measurably support business goals.' },
  { id: 'd2-4', domain: 2, concept: 'RACI accountability', truth: 'Each key decision should have one clearly accountable role to avoid ambiguity.' },
  { id: 'd2-5', domain: 2, concept: 'Steering committee', truth: 'Steering committees prioritize IT portfolios based on strategy, value, and risk.' },
  { id: 'd2-6', domain: 2, concept: 'Three lines model', truth: 'Operations own risk, oversight functions monitor risk, and audit provides independent assurance.' },
  { id: 'd2-7', domain: 2, concept: 'Risk appetite', truth: 'Risk appetite is the broad level of risk leadership is willing to accept.' },
  { id: 'd2-8', domain: 2, concept: 'Risk tolerance', truth: 'Risk tolerance defines acceptable variance around specific objective outcomes.' },
  { id: 'd2-9', domain: 2, concept: 'Maturity metrics', truth: 'Maturity assessments should inform action plans, not serve as a box-checking exercise.' },
  { id: 'd2-10', domain: 2, concept: 'Policy governance', truth: 'Governance should enforce policy ownership, review cycles, and exception accountability.' },
  { id: 'd2-11', domain: 2, concept: 'Performance reporting', truth: 'KPI reporting should connect IT activity to business outcomes and risk reduction.' },
  { id: 'd2-12', domain: 2, concept: 'Escalation pathways', truth: 'Escalation paths should be clear so critical IT risk decisions reach proper authorities.' },

  { id: 'd3-1', domain: 3, concept: 'Control timing', truth: 'Security and control requirements should be defined early in requirements and design.' },
  { id: 'd3-2', domain: 3, concept: 'Business case', truth: 'A business case should justify expected value, cost, and risk assumptions.' },
  { id: 'd3-3', domain: 3, concept: 'Change governance', truth: 'Production changes should require impact analysis, approval, testing, and rollback planning.' },
  { id: 'd3-4', domain: 3, concept: 'Traceability', truth: 'Traceability links requirements to test evidence and acceptance decisions.' },
  { id: 'd3-5', domain: 3, concept: 'UAT role', truth: 'User acceptance testing confirms that solutions meet business process needs.' },
  { id: 'd3-6', domain: 3, concept: 'Integration testing', truth: 'Integration testing validates interactions among components before release.' },
  { id: 'd3-7', domain: 3, concept: 'System testing', truth: 'System testing verifies end-to-end behavior against defined requirements.' },
  { id: 'd3-8', domain: 3, concept: 'Post-implementation review', truth: 'PIR validates whether delivered systems achieved expected business and control outcomes.' },
  { id: 'd3-9', domain: 3, concept: 'Scope control', truth: 'Formal scope control reduces uncontrolled changes and budget overruns.' },
  { id: 'd3-10', domain: 3, concept: 'Segregation in development', truth: 'Separating development and production duties reduces unauthorized change risk.' },
  { id: 'd3-11', domain: 3, concept: 'Quality gate', truth: 'Release quality gates should block deployment when critical controls fail.' },
  { id: 'd3-12', domain: 3, concept: 'Requirements clarity', truth: 'Ambiguous requirements increase defect, rework, and control design risk.' },

  { id: 'd4-1', domain: 4, concept: 'Incident management', truth: 'Incident management prioritizes rapid restoration of service availability.' },
  { id: 'd4-2', domain: 4, concept: 'Problem management', truth: 'Problem management investigates root cause to prevent repeat incidents.' },
  { id: 'd4-3', domain: 4, concept: 'BIA purpose', truth: 'Business impact analysis identifies critical processes and impact over time.' },
  { id: 'd4-4', domain: 4, concept: 'RPO meaning', truth: 'RPO defines maximum acceptable data loss measured in time.' },
  { id: 'd4-5', domain: 4, concept: 'RTO meaning', truth: 'RTO defines target time to restore required service after disruption.' },
  { id: 'd4-6', domain: 4, concept: 'MTD relationship', truth: 'MTD is constrained by total tolerable downtime and includes both recovery and work restoration.' },
  { id: 'd4-7', domain: 4, concept: 'DR test maturity', truth: 'Progressive DR testing builds confidence from tabletop through interruption exercises.' },
  { id: 'd4-8', domain: 4, concept: 'SLA alignment', truth: 'SLA targets should align with OLA and vendor commitments to be achievable.' },
  { id: 'd4-9', domain: 4, concept: 'Capacity planning', truth: 'Capacity planning anticipates growth to prevent performance and availability failures.' },
  { id: 'd4-10', domain: 4, concept: 'Backup strategy', truth: 'Backup frequency should be selected to satisfy business-defined RPO requirements.' },
  { id: 'd4-11', domain: 4, concept: 'Change enablement', truth: 'Change enablement lowers operational risk by controlling production modifications.' },
  { id: 'd4-12', domain: 4, concept: 'Monitoring quality', truth: 'Monitoring should provide actionable alerts tied to service and risk thresholds.' },

  { id: 'd5-1', domain: 5, concept: 'CIA triad', truth: 'Security controls should map to confidentiality, integrity, and availability objectives.' },
  { id: 'd5-2', domain: 5, concept: 'Least privilege', truth: 'Least privilege grants only the minimum access required to perform assigned duties.' },
  { id: 'd5-3', domain: 5, concept: 'RBAC model', truth: 'RBAC improves scalable permission consistency by assigning access to roles.' },
  { id: 'd5-4', domain: 5, concept: 'Defense in depth', truth: 'Layered preventive, detective, and corrective controls reduce single-point security failure.' },
  { id: 'd5-5', domain: 5, concept: 'Digital signatures', truth: 'Digital signatures provide integrity and non-repudiation by signing hashes with private keys.' },
  { id: 'd5-6', domain: 5, concept: 'PKI trust', truth: 'PKI trust depends on certificate authority validation and certificate lifecycle controls.' },
  { id: 'd5-7', domain: 5, concept: 'Data classification', truth: 'Data classification should drive handling, retention, and protection requirements.' },
  { id: 'd5-8', domain: 5, concept: 'Network segmentation', truth: 'Segmentation limits lateral movement and reduces blast radius during compromise.' },
  { id: 'd5-9', domain: 5, concept: 'MFA value', truth: 'MFA reduces unauthorized access risk even when passwords are compromised.' },
  { id: 'd5-10', domain: 5, concept: 'Logging controls', truth: 'Security logging should support detection, investigation, and evidence retention.' },
  { id: 'd5-11', domain: 5, concept: 'Vulnerability management', truth: 'Vulnerability management should prioritize remediation by exploitability and business impact.' },
  { id: 'd5-12', domain: 5, concept: 'Encryption scope', truth: 'Encryption controls confidentiality but should be paired with access and monitoring controls.' },
];

function buildFactQuestions(): QuizQuestion[] {
  const perDomainMap = new Map<number, QuizFact[]>();
  QUIZ_FACTS.forEach((fact) => {
    const domainFacts = perDomainMap.get(fact.domain) ?? [];
    domainFacts.push(fact);
    perDomainMap.set(fact.domain, domainFacts);
  });

  const generated: QuizQuestion[] = [];
  let nextId = 5000;

  QUIZ_FACTS.forEach((fact, idx) => {
    const domainFacts = (perDomainMap.get(fact.domain) ?? []).filter((item) => item.id !== fact.id);
    const distractors = [
      domainFacts[(idx + 1) % domainFacts.length]?.truth,
      domainFacts[(idx + 4) % domainFacts.length]?.truth,
      domainFacts[(idx + 7) % domainFacts.length]?.truth,
    ].filter(Boolean) as string[];

    generated.push({
      id: nextId++,
      domain: fact.domain,
      question: `Which statement is MOST accurate regarding ${fact.concept.toLowerCase()}?`,
      options: [fact.truth, ...distractors],
      answer: 0,
      explanation: fact.truth,
    });

    generated.push({
      id: nextId++,
      domain: fact.domain,
      question: `In an audit scenario focused on ${fact.concept.toLowerCase()}, which response BEST aligns with CISA logic?`,
      options: [fact.truth, ...distractors],
      answer: 0,
      explanation: `Best-practice answer: ${fact.truth}`,
    });
  });

  return generated;
}

const QUESTION_BANK: QuizQuestion[] = [...SCENARIO_QUESTIONS, ...buildFactQuestions()];

const CONTROL_LIBRARY = [
  { name: 'Multi-factor authentication', type: 'Preventive' },
  { name: 'SIEM alert correlation', type: 'Detective' },
  { name: 'Backup restoration procedure', type: 'Corrective' },
  { name: 'Segregation of duties', type: 'Preventive' },
  { name: 'Vulnerability scan', type: 'Detective' },
  { name: 'Disaster recovery failover runbook', type: 'Corrective' },
];

const THIRTY_DAY_PLAN: StudyDay[] = [
  { day: 1, domain: 1, title: 'Audit Charter and Independence', objective: 'Lock in audit authority, scope, and reporting line fundamentals.', drills: ['Read Domain 1 exam focus + common traps.', 'Write a 5-line mock audit charter.', 'Do 12 Domain 1 flashcards.'], checkpoint: 'Explain why independence is stronger when audit reports to the board/audit committee.' },
  { day: 2, domain: 1, title: 'Risk-Based Audit Planning', objective: 'Prioritize audits using risk and materiality.', drills: ['Define risk universe for 6 sample processes.', 'Rank top 3 audits by risk impact and likelihood.', 'Answer 10 planning-focused quiz questions.'], checkpoint: 'Justify why high-risk + high-impact areas should be first in annual planning.' },
  { day: 3, domain: 1, title: 'Evidence Quality and Sufficiency', objective: 'Differentiate weak vs strong evidence quickly.', drills: ['Classify 10 evidence examples by reliability.', 'Map evidence to control objective coverage.', 'Practice 10 mixed flashcards.'], checkpoint: 'State which evidence is most reliable and why.' },
  { day: 4, domain: 1, title: 'Sampling Strategy', objective: 'Choose the correct sampling method for each audit test.', drills: ['Match 8 scenarios to attribute or variable sampling.', 'Calculate sample risk impact in plain language.', 'Review all Domain 1 glossary terms.'], checkpoint: 'Identify when attribute sampling is superior to variable sampling.' },
  { day: 5, domain: 1, title: 'Audit Reporting and Follow-up', objective: 'Write actionable findings and clear recommendations.', drills: ['Draft one finding with condition/cause/effect/recommendation.', 'Prioritize recommendations by residual risk.', 'Take 15 Domain 1 questions.'], checkpoint: 'Describe why follow-up confirms remediation effectiveness.' },
  { day: 6, domain: 2, title: 'IT Governance Fundamentals', objective: 'Differentiate governance outcomes from management execution.', drills: ['Map 8 activities to governance vs management.', 'Summarize COBIT role split in 6 bullets.', 'Flashcard set: governance concepts.'], checkpoint: 'Explain evaluate-direct-monitor in one sentence.' },
  { day: 7, domain: 2, title: 'Business and IT Alignment', objective: 'Tie IT initiatives directly to business objectives.', drills: ['Create 5 examples of business objective to IT initiative mapping.', 'Identify 4 bad alignment indicators.', 'Run 10 Domain 2 quiz questions.'], checkpoint: 'Choose the best alignment indicator and defend it.' },
  { day: 8, domain: 2, title: 'Risk Ownership and Accountability', objective: 'Eliminate confusion around who owns risk decisions.', drills: ['Build a sample RACI for change approval.', 'Label first/second/third line responsibilities.', 'Review risk appetite vs tolerance.'], checkpoint: 'State who owns IT risk and why.' },
  { day: 9, domain: 2, title: 'Steering Committee and Portfolio Priorities', objective: 'Understand portfolio governance and prioritization controls.', drills: ['Prioritize 6 projects based on strategic fit and risk.', 'Define steering committee inputs and outputs.', 'Complete 12 governance flashcards.'], checkpoint: 'Identify what the steering committee should decide vs delegate.' },
  { day: 10, domain: 2, title: 'Governance Metrics and Maturity', objective: 'Read governance performance indicators with audit logic.', drills: ['Create 1 balanced scorecard-style KPI set.', 'Map maturity levels from ad hoc to optimizing.', '15-question mixed quiz.'], checkpoint: 'Explain why KPI quality matters more than KPI quantity.' },
  { day: 11, domain: 3, title: 'Business Case and Feasibility', objective: 'Validate project initiation controls and value assumptions.', drills: ['Review cost-benefit and risk assumptions in a mock business case.', 'List 5 red flags in weak feasibility analysis.', 'Flashcards Domain 3 start set.'], checkpoint: 'Identify one control that prevents weak project approval decisions.' },
  { day: 12, domain: 3, title: 'Secure SDLC Integration', objective: 'Place controls early in the lifecycle.', drills: ['Map security controls to requirements/design/build/test phases.', 'Write 4 examples of shift-left controls.', 'Run 12 SDLC-focused questions.'], checkpoint: 'Defend why late testing is not enough for control assurance.' },
  { day: 13, domain: 3, title: 'Project Governance and Change Control', objective: 'Audit governance over schedule, scope, and quality drift.', drills: ['Build a change-control checklist.', 'Identify 5 signs of uncontrolled scope creep.', 'Do 10 mixed flashcards.'], checkpoint: 'State the minimum approvals before production-impacting change.' },
  { day: 14, domain: 3, title: 'Testing Strategy and Traceability', objective: 'Verify end-to-end requirement coverage.', drills: ['Create traceability matrix sample for 6 requirements.', 'Sequence unit/integration/system/UAT correctly.', 'Run 15 testing questions.'], checkpoint: 'Explain why integration + system testing catches risks unit testing misses.' },
  { day: 15, domain: 3, title: 'Post-Implementation Review', objective: 'Validate business outcomes after go-live.', drills: ['Draft PIR checklist with control and value metrics.', 'Identify 4 indicators deployment failed its business case.', 'Flashcards + quiz review.'], checkpoint: 'Summarize PIR purpose in one exam-ready sentence.' },
  { day: 16, domain: 4, title: 'IT Operations Control Model', objective: 'Understand operational discipline in steady-state systems.', drills: ['Map incident/problem/change/capacity relationships.', 'List 5 controls that stabilize production environments.', 'Domain 4 flashcards round 1.'], checkpoint: 'Differentiate incident restoration from root-cause problem work.' },
  { day: 17, domain: 4, title: 'Service Levels and Availability', objective: 'Evaluate SLA/OLA/UC control boundaries.', drills: ['Classify 9 metrics to SLA vs OLA vs UC.', 'Define service target breach escalation path.', 'Take 10 operations questions.'], checkpoint: 'Identify who is accountable when SLA breach occurs.' },
  { day: 18, domain: 4, title: 'BIA and Critical Process Mapping', objective: 'Derive recovery requirements from business impact.', drills: ['Score 6 processes by business impact tiers.', 'Define dependency map for one critical process.', 'Glossary refresh: continuity terms.'], checkpoint: 'State why BIA must come before DR solution design.' },
  { day: 19, domain: 4, title: 'RTO, RPO, WRT, MTD Mastery', objective: 'Compute resilience metrics without hesitation.', drills: ['Solve 12 timing metric scenarios.', 'Convert narrative outage statements into RTO/RPO values.', 'Quiz block: continuity calculations.'], checkpoint: 'Calculate WRT when given MTD and RTO.' },
  { day: 20, domain: 4, title: 'Disaster Recovery Testing', objective: 'Choose the right DR test type for risk tolerance.', drills: ['Compare tabletop, simulation, parallel, interruption.', 'Select test type for 5 outage risk cases.', 'Flashcards Domain 4 round 2.'], checkpoint: 'Explain when full interruption testing is justified.' },
  { day: 21, domain: 5, title: 'Security Governance and CIA', objective: 'Anchor control choices to CIA impact analysis.', drills: ['Map 10 controls to CIA objectives.', 'Identify false “security theater” controls.', 'Take 12 security governance questions.'], checkpoint: 'Choose control objective before technology choice.' },
  { day: 22, domain: 5, title: 'Access Control Models and IAM', objective: 'Apply MAC/DAC/RBAC decisions to real cases.', drills: ['Map 8 use cases to IAM models.', 'Design least-privilege role matrix sample.', 'Flashcards on IAM and SoD.'], checkpoint: 'Explain why RBAC is typically strongest for enterprise role consistency.' },
  { day: 23, domain: 5, title: 'Network and Infrastructure Security', objective: 'Differentiate layered network controls and monitoring.', drills: ['Classify controls: firewall, IDS/IPS, segmentation, proxy.', 'Map controls to attack paths.', '15-question network security set.'], checkpoint: 'Describe one defense-in-depth chain from endpoint to SIEM.' },
  { day: 24, domain: 5, title: 'Cryptography and PKI', objective: 'Use encryption concepts for exam scenarios.', drills: ['Explain symmetric vs asymmetric use cases.', 'Trace digital signature workflow.', 'Review certificate lifecycle roles.'], checkpoint: 'State how non-repudiation is achieved.' },
  { day: 25, domain: 5, title: 'Data Protection and Privacy Controls', objective: 'Match data classification to protection controls.', drills: ['Create classification matrix with handling rules.', 'Define 5 data lifecycle control points.', 'Quiz block: data privacy scenarios.'], checkpoint: 'Select control response based on data sensitivity and regulatory risk.' },
  { day: 26, domain: 0, title: 'Mixed Domain Review I', objective: 'Blend domains to strengthen question discrimination.', drills: ['Run 50-question mixed timed set.', 'Tag every miss by root cause (knowledge vs wording vs logic).', 'Review top 10 misses immediately.'], checkpoint: 'Identify your two weakest domains by evidence.' },
  { day: 27, domain: 0, title: 'Mixed Domain Review II', objective: 'Repair weak domains with targeted reinforcement.', drills: ['Do 30 flashcards from weak domains only.', 'Run 25-question targeted quiz.', 'Write one-page weak-domain summary sheet.'], checkpoint: 'Raise weak-domain score by at least 10% over day 26.' },
  { day: 28, domain: 0, title: 'Full Mock Exam', objective: 'Simulate real exam pressure and pacing.', drills: ['Take full timed simulator in one sitting.', 'Review all wrong answers and distractors.', 'Update final cram list.'], checkpoint: 'Meet or exceed your target score under timed conditions.' },
  { day: 29, domain: 0, title: 'Final Gap Closure Day', objective: 'Close last conceptual gaps and formula slips.', drills: ['Rework all missed metric and governance questions.', 'Memorize top 20 high-yield concepts.', 'Flashcards: only review queue.'], checkpoint: 'Explain each previously missed concept without notes.' },
  { day: 30, domain: 0, title: 'Exam Readiness Lock-in', objective: 'Consolidate confidence and decision strategy for exam day.', drills: ['Run a light 20-question confidence check.', 'Review memory anchors for all 5 domains.', 'Prepare exam-day pacing and break plan.'], checkpoint: 'You can justify best answer choices using risk, governance, and control logic.' },
];

const DAY_ENRICHMENT: Record<number, { realWorldExample: string; deepExplanation: string }> = {
  1: { realWorldExample: 'A financial services internal audit team was asked to approve IAM role changes directly in production. The chief audit executive rejected ownership and moved the function to IT operations, then audited the process quarterly.', deepExplanation: 'This day focuses on independence because CISA questions often test whether assurance is still objective. If audit owns operations, assurance quality collapses. Learning to spot this boundary early helps you eliminate tempting but incorrect answers.' },
  2: { realWorldExample: 'An enterprise had 120 auditable entities but only 12 annual audit slots. They scored impact, likelihood, and control maturity, then prioritized high residual-risk payment and identity processes first.', deepExplanation: 'Risk-based planning is about evidence-backed prioritization, not equal coverage. This day teaches how to defend why high-risk processes are audited first and why low-risk areas can be deferred without losing audit credibility.' },
  3: { realWorldExample: 'During a breach review, management interviews said patching was timely, but immutable system logs showed 45-day delays. The audit report relied on logs and ticket evidence over verbal claims.', deepExplanation: 'CISA expects you to rank evidence quality correctly. This day trains you to distinguish corroborated evidence from weak testimony, so you can choose responses that produce defensible findings under scrutiny.' },
  4: { realWorldExample: 'Auditors tested approvals above $25,000. They used attribute sampling to estimate compliance rate rather than variable sampling, which would have been better for quantifying dollar error.', deepExplanation: 'Sampling errors are common exam traps. This day builds decision discipline: first identify whether the test asks yes/no control presence or numeric valuation, then choose the matching method.' },
  5: { realWorldExample: 'A healthcare audit noted repeated privileged-access exceptions. The report documented condition, criteria, cause, effect, and recommendation, then followed up after 90 days to validate corrective control operation.', deepExplanation: 'Strong reporting is persuasive because it ties risk to action and accountability. This day shows how follow-up confirms operating effectiveness rather than just project closure paperwork.' },
  6: { realWorldExample: 'A retailer’s IT PMO treated governance and management as the same thing, causing board-level decisions to stall in operational meetings. They split governance oversight from execution management and decision latency dropped.', deepExplanation: 'This day anchors the governance-management split tested across many CISA items. Understanding who decides versus who executes helps you identify structurally correct answers quickly.' },
  7: { realWorldExample: 'A CIO launched a cloud modernization initiative, but revenue-impact KPIs were absent. The steering committee paused funding until business outcome metrics were explicitly mapped to the initiative.', deepExplanation: 'Alignment is proven by business impact, not technical activity. This day teaches you to reject process-only metrics and prefer options tied to measurable strategic outcomes.' },
  8: { realWorldExample: 'After a ransomware event, the CISO tried to formally “accept” downtime risk. Governance corrected this by documenting business process owners as risk acceptors, with security as advisor.', deepExplanation: 'Ownership clarity prevents governance failure. This day reinforces that business management owns risk decisions while security and IT implement and monitor treatment plans.' },
  9: { realWorldExample: 'A global manufacturer had eight competing ERP projects. The steering committee used strategic fit, dependency, and risk scoring to sequence work and avoid overloading change capacity.', deepExplanation: 'Portfolio governance is about constrained optimization. This day links prioritization logic to exam scenarios where several options seem plausible but only one reflects accountable governance.' },
  10: { realWorldExample: 'A telecom firm tracked 70 IT KPIs but leadership could not act on them. They reduced to 12 decision-grade metrics mapped to customer impact, resilience, and risk reduction.', deepExplanation: 'Metric quality beats metric volume. This day teaches why actionable indicators support governance better than vanity dashboards and helps avoid “more metrics is better” distractors.' },
  11: { realWorldExample: 'A CRM replacement passed budget review but omitted compliance remediation costs. A revised business case included regulatory risk exposure and changed the investment decision.', deepExplanation: 'Business cases must reflect real risk-adjusted value. This day trains you to evaluate whether feasibility assumptions are complete enough to support responsible approval.' },
  12: { realWorldExample: 'A fintech team delayed logging and encryption controls until pre-release testing. Release was blocked when controls failed and remediation required architecture changes.', deepExplanation: 'Shift-left control design is cheaper and safer. This day explains why early requirements and design decisions dominate downstream risk and cost.' },
  13: { realWorldExample: 'A major release added late scope changes without CAB review. Outage probability increased, and rollback failed due to missing test evidence.', deepExplanation: 'Governance over change protects delivery integrity. This day shows how formal approvals, impact analysis, and rollback readiness reduce preventable production incidents.' },
  14: { realWorldExample: 'A payments system passed unit tests but failed in integration when currency rounding logic conflicted between services. A traceability matrix would have exposed the missing case earlier.', deepExplanation: 'Traceability ensures test completeness against requirements. This day builds practical insight into why integration and system tests are essential for audit assurance.' },
  15: { realWorldExample: 'Post go-live, a procurement platform showed lower-than-expected adoption and unresolved manual workarounds. PIR identified process misfit and triggered targeted remediation.', deepExplanation: 'PIR validates business outcome realization, not just technical deployment. This day teaches you to evaluate success using value and control metrics together.' },
  16: { realWorldExample: 'An e-commerce site had frequent service interruptions because incidents were closed quickly but root causes were never addressed. Problem management backlog cleanup reduced repeat incidents.', deepExplanation: 'Operations maturity depends on separating restoration from prevention. This day strengthens your ability to pick the right process objective in service-management scenarios.' },
  17: { realWorldExample: 'A SaaS provider had aggressive SLA uptime promises but weak internal OLA handoffs. Incident response missed targets until internal obligations were renegotiated and aligned.', deepExplanation: 'SLA performance depends on internal and vendor support structures. This day teaches dependency-aware accountability logic that appears in operations governance questions.' },
  18: { realWorldExample: 'A hospital’s BIA identified pharmacy dispensing as a top-critical process, reprioritizing recovery investment away from lower-impact administrative systems.', deepExplanation: 'BIA is a prioritization engine. This day shows how impact over time should drive continuity planning decisions before technology procurement starts.' },
  19: { realWorldExample: 'An enterprise set MTD at 24h and RTO at 10h but ignored WRT, causing recovery tasks to exceed tolerance. Updated planning explicitly budgeted WRT and met continuity objectives.', deepExplanation: 'Metric relationships matter operationally, not just mathematically. This day helps you solve timing questions and understand why incomplete metrics create false readiness.' },
  20: { realWorldExample: 'A bank relied on tabletop DR tests for years; first parallel test exposed replication lag and undocumented dependencies. Remediation improved true failover confidence.', deepExplanation: 'DR tests should mature progressively to reveal hidden failures. This day links test depth to confidence level so you can choose realistic, risk-appropriate testing strategies.' },
  21: { realWorldExample: 'A company bought advanced security tools without mapping control objectives. Gaps remained in availability controls despite strong confidentiality tooling.', deepExplanation: 'CIA-first thinking prevents control blind spots. This day teaches structured selection: define control objective, then choose technology.' },
  22: { realWorldExample: 'A large enterprise moved from ad hoc user-level permissions to RBAC roles tied to job functions. Access reviews became faster and SoD conflicts dropped materially.', deepExplanation: 'IAM scalability requires consistent role design. This day helps you prefer models that improve governance, reviewability, and least-privilege enforcement at scale.' },
  23: { realWorldExample: 'After a lateral movement incident, segmentation and internal firewall policies were tightened between critical zones, reducing blast radius in subsequent simulations.', deepExplanation: 'Network security is layered architecture, not a single control. This day explains how preventive and detective layers combine to reduce compromise propagation risk.' },
  24: { realWorldExample: 'A procurement workflow required signature non-repudiation for approvals. Digital signatures with certificate validation provided evidentiary integrity in disputes.', deepExplanation: 'Crypto questions test use-case fit, not algorithm trivia. This day links PKI and signatures to business assurance requirements like authenticity and integrity proof.' },
  25: { realWorldExample: 'A data leak involved misclassified customer files stored in shared drives. After classification and handling policies were enforced, exposure pathways were reduced.', deepExplanation: 'Classification drives control depth. This day teaches that protection controls should follow data sensitivity and regulatory impact, not uniform blanket rules.' },
  26: { realWorldExample: 'A candidate scored 82% overall but had concentrated misses in governance and continuity. Root-cause tagging showed distractor confusion in accountability questions.', deepExplanation: 'Mixed review reveals cross-domain reasoning weaknesses. This day trains diagnostic study behavior so remediation targets decision logic, not only memorization.' },
  27: { realWorldExample: 'After identifying weak operations topics, a learner ran domain-specific drills and improved targeted-domain accuracy by 14 points in two days.', deepExplanation: 'Focused reinforcement works when tied to measurable weak areas. This day shows how evidence-based iteration improves score consistency before full mocks.' },
  28: { realWorldExample: 'During a full timed mock, a learner used planned pacing checkpoints every 20 questions and avoided late-exam rush errors seen in prior attempts.', deepExplanation: 'Mock exams test endurance, pacing, and judgment under pressure. This day explains why simulation quality matters as much as content knowledge near exam date.' },
  29: { realWorldExample: 'Final review highlighted repeated misses in RTO/RPO math and risk ownership wording. Targeted mini-drills eliminated those errors before exam day.', deepExplanation: 'Last-mile gains come from precision correction, not broad rereading. This day teaches tactical closure of recurring error patterns.' },
  30: { realWorldExample: 'On exam day, a candidate used a preplanned pacing strategy, flagged uncertain items, and applied elimination based on governance and control principles, finishing with stable accuracy.', deepExplanation: 'Readiness means repeatable decision discipline under stress. This day ties all domains together into an execution strategy for real exam conditions.' },
};

const DOMAIN_LEARNING_PACKS: Record<number, DomainLearningPack> = {
  0: {
    concepts: [
      'Use elimination logic: reject options that break governance ownership or control objectives.',
      'Read every scenario through risk first, then control, then feasibility.',
      'When choices are close, prefer answers that preserve accountability and independence.',
      'Convert weak domains into daily micro-drills with repeated spaced recall.',
      'Track misses by root cause: concept gap, keyword miss, or distractor confusion.',
      'Timed performance matters: practice pacing with checkpoint scans every 20 questions.',
    ],
    scenarioPrompt:
      'A candidate scores well on security content but repeatedly misses governance and continuity questions under time pressure. Design a correction approach for the final week.',
    scenarioAnswer:
      'Reallocate hours to weak domains, run mixed timed sets daily, and perform same-day error reviews focused on accountability and resilience metrics.',
    knowledgeChecks: [
      'What is your weakest domain and what 2 concepts inside it cause most errors?',
      'How do you decide between two plausible answer choices in CISA scenarios?',
      'What pacing strategy keeps accuracy stable during a full mock?',
      'Why should wrong-answer review happen the same day as the mock?',
    ],
  },
  1: {
    concepts: [
      'Audit independence is foundational and must be preserved in recommendations and reporting lines.',
      'Risk-based planning aligns scarce audit effort to high-impact exposures.',
      'Evidence reliability increases with independence, objectivity, and direct observability.',
      'Attribute sampling estimates compliance rate; variable sampling estimates error magnitude.',
      'Good findings include condition, criteria, cause, effect, and practical recommendation.',
      'Follow-up validates remediation effectiveness, not just action completion.',
    ],
    scenarioPrompt:
      'An auditor is asked by management to design the new control process while also auditing it this quarter. What should happen?',
    scenarioAnswer:
      'The auditor should avoid control ownership/design responsibility and maintain assurance independence, while advising at a high level if permitted by policy.',
    knowledgeChecks: [
      'What makes one evidence source more reliable than another?',
      'When is attribute sampling the best choice?',
      'Why does audit reporting structure matter for assurance quality?',
      'What is the main objective of audit follow-up?',
    ],
  },
  2: {
    concepts: [
      'Governance evaluates, directs, and monitors; management plans, builds, and runs.',
      'Business process owners own risk acceptance decisions.',
      'IT strategy quality is measured by measurable business objective support.',
      'RACI clarity requires a single accountable role per decision.',
      'Steering committees prioritize portfolios based on strategic value and risk.',
      'Maturity metrics should drive decisions, not become checklist theater.',
    ],
    scenarioPrompt:
      'Two executives dispute ownership of a major technology risk. Security wants ownership; business says it is technical only.',
    scenarioAnswer:
      'Business leadership remains risk owner; security and IT provide treatment options and execution support under governance oversight.',
    knowledgeChecks: [
      'How do you prove IT-business alignment objectively?',
      'Who owns IT risk and why?',
      'What governance failure occurs with multiple accountable roles?',
      'How does a steering committee reduce portfolio risk?',
    ],
  },
  3: {
    concepts: [
      'Controls are strongest when embedded at requirements and architecture stages.',
      'Business case validation prevents low-value or high-risk project starts.',
      'Change governance protects scope, quality, and deployment safety.',
      'Traceability links requirements to test cases and acceptance evidence.',
      'Integration/system testing catches risks isolated unit tests miss.',
      'Post-implementation review confirms value realization and control outcomes.',
    ],
    scenarioPrompt:
      'A project proposes deferring most security control design until late testing to accelerate delivery. What is the best audit stance?',
    scenarioAnswer:
      'Reject deferral and require early control definition in requirements/design to avoid structural risk and expensive rework.',
    knowledgeChecks: [
      'Why is shift-left control design superior to late-stage fixes?',
      'What does traceability prove during audits?',
      'Which governance control limits scope creep?',
      'What does PIR validate after go-live?',
    ],
  },
  4: {
    concepts: [
      'Incident management restores service quickly; problem management removes root causes.',
      'SLA, OLA, and UC must align to avoid accountability gaps during outages.',
      'BIA identifies critical processes and impact escalation over time.',
      'MTD = RTO + WRT and constrains recovery strategy choices.',
      'RPO defines acceptable data loss window and backup frequency needs.',
      'DR testing maturity improves confidence in continuity under real stress.',
    ],
    scenarioPrompt:
      'An organization selected a fast failover platform but never validated business recovery tolerances or work recovery steps. What is the key issue?',
    scenarioAnswer:
      'Technology was selected before BIA-driven requirements; continuity design is incomplete without validated RTO/RPO/WRT/MTD alignment.',
    knowledgeChecks: [
      'How do RTO and RPO differ in recovery decisions?',
      'Why must BIA happen before DR architecture selection?',
      'When is full interruption testing justified?',
      'What distinguishes incident from problem management outcomes?',
    ],
  },
  5: {
    concepts: [
      'Use CIA impact to select control objectives before selecting tools.',
      'Least privilege and segregation of duties reduce privilege abuse risk.',
      'RBAC supports scalable access consistency in enterprise environments.',
      'Defense in depth combines preventive, detective, and corrective layers.',
      'Digital signatures provide integrity and non-repudiation assurance.',
      'Data classification drives handling, retention, and protection controls.',
    ],
    scenarioPrompt:
      'A team encrypts sensitive data but leaves broad user privileges and weak monitoring unchanged. Is risk adequately treated?',
    scenarioAnswer:
      'No. Encryption alone is insufficient; access control and monitoring gaps leave material residual risk.',
    knowledgeChecks: [
      'Why is RBAC often preferred over DAC in large enterprises?',
      'Which control objective does digital signature address most directly?',
      'How does defense in depth reduce single-control failure impact?',
      'Why must classification precede protection policy decisions?',
    ],
  },
};

function domainById(id: number) {
  return DOMAINS.find((d) => d.id === id) ?? DOMAINS[0];
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function shuffleArray<T>(items: T[]): T[] {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = clone[i];
    clone[i] = clone[j];
    clone[j] = temp;
  }
  return clone;
}

function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const indexedOptions = question.options.map((option, index) => ({ option, index }));
  const shuffled = shuffleArray(indexedOptions);
  const newAnswer = shuffled.findIndex((item) => item.index === question.answer);
  return {
    ...question,
    options: shuffled.map((item) => item.option),
    answer: newAnswer,
  };
}

function buildExamSet(questionCount: number): QuizQuestion[] {
  return shuffleArray(QUESTION_BANK)
    .slice(0, Math.min(questionCount, QUESTION_BANK.length))
    .map((question) => shuffleQuestionOptions(question));
}

function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  readinessScore,
  theme,
  toggleTheme,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  readinessScore: number;
  theme: ThemeMode;
  toggleTheme: () => void;
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'thirtyday', label: '30-Day Plan', icon: <CalendarClock className="w-5 h-5" /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <BookMarked className="w-5 h-5" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'quiz', label: 'Exam Simulator', icon: <Award className="w-5 h-5" /> },
    { id: 'tools', label: 'GRC Tools', icon: <Activity className="w-5 h-5" /> },
    { id: 'ai', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800 w-[85vw] max-w-72">
      <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileOpen(false);
          }}
          className="flex items-center gap-3 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          aria-label="Go to home dashboard"
        >
          <div className="bg-emerald-500 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">CISA Pass Lab</h1>
            <p className="text-xs text-slate-400">Exam-focused GRC training</p>
          </div>
        </button>
        <button
          onClick={toggleTheme}
          className="ml-auto p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id ? 'bg-emerald-500/15 text-emerald-300 font-medium' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
            {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800">
          <p className="text-xs text-slate-400 mb-2">Readiness Index</p>
          <div className="text-3xl font-bold text-white">{readinessScore}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${readinessScore}%` }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block h-screen sticky top-0">{sidebarContent}</div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden w-[85vw] max-w-72"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Dashboard({
  setActiveTab,
  readinessScore,
  masteredCount,
  averageQuiz,
  attempts,
  focusDomains,
}: {
  setActiveTab: (tab: string) => void;
  readinessScore: number;
  masteredCount: number;
  averageQuiz: number;
  attempts: number;
  focusDomains: Array<{ id: number; title: string; gap: number }>;
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">Pass-plan Dashboard</h2>
        <p className="text-slate-400 mt-1">Use readiness metrics and weighted gaps to focus on what moves your score fastest.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <MetricCard icon={<Target className="w-7 h-7" />} label="Readiness" value={`${readinessScore}%`} tone="emerald" />
        <MetricCard icon={<BrainCircuit className="w-7 h-7" />} label="Cards Mastered" value={`${masteredCount}/${FLASHCARDS.length}`} tone="sky" />
        <MetricCard icon={<Award className="w-7 h-7" />} label="Avg Quiz" value={`${averageQuiz}%`} tone="amber" />
        <MetricCard icon={<TrendingUp className="w-7 h-7" />} label="Quiz Attempts" value={`${attempts}`} tone="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Weighted Domain Gaps</h3>
            <button
              onClick={() => setActiveTab('quiz')}
              className="text-sm text-emerald-300 hover:text-emerald-200 font-medium flex items-center gap-1"
            >
              Run timed practice <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-5">
            {focusDomains.map((domain) => (
              <div key={domain.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Domain {domain.id}: {domain.title}</span>
                  <span className="text-rose-300">Gap {domain.gap}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${domain.gap}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">7-Day Sprint</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="bg-slate-800/60 rounded-lg p-3">Day 1-2: 40 flashcards on your weakest domain, then 10 mixed quiz questions.</li>
            <li className="bg-slate-800/60 rounded-lg p-3">Day 3-4: Review wrong quiz items and rewrite “why each distractor is wrong.”</li>
            <li className="bg-slate-800/60 rounded-lg p-3">Day 5: Full timed simulator in one session.</li>
            <li className="bg-slate-800/60 rounded-lg p-3">Day 6: Domain 4 and 5 continuity + security reinforcement.</li>
            <li className="bg-slate-800/60 rounded-lg p-3">Day 7: Light recall and formula refresh (RTO/RPO/MTD, sampling, RACI).</li>
          </ul>
        </section>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ActionCard
          title="Knowledge Drills"
          description="Study domain traps, memory anchors, and high-yield terms before practice tests."
          actionLabel="Open Knowledge Base"
          onClick={() => setActiveTab('knowledge')}
          tone="slate"
        />
        <ActionCard
          title="Adaptive Flashcards"
          description="Use domain filters and review queue to improve retention where you are weak."
          actionLabel="Start Flashcards"
          onClick={() => setActiveTab('flashcards')}
          tone="emerald"
        />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'emerald' | 'sky' | 'amber' | 'violet' }) {
  const toneClass = {
    emerald: 'from-emerald-500/20 to-emerald-400/5 text-emerald-300 border-emerald-500/20',
    sky: 'from-sky-500/20 to-sky-400/5 text-sky-300 border-sky-500/20',
    amber: 'from-amber-500/20 to-amber-400/5 text-amber-300 border-amber-500/20',
    violet: 'from-violet-500/20 to-violet-400/5 text-violet-300 border-violet-500/20',
  };

  return (
    <div className={`bg-gradient-to-br ${toneClass[tone]} border rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-100">{icon}</div>
      </div>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function ActionCard({ title, description, actionLabel, onClick, tone }: { title: string; description: string; actionLabel: string; onClick: () => void; tone: 'slate' | 'emerald' }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-6 border transition-all hover:-translate-y-0.5 ${
        tone === 'emerald'
          ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
          : 'bg-slate-900 border-slate-800 hover:bg-slate-900/80'
      }`}
    >
      <h3 className="text-xl text-white font-bold mb-2">{title}</h3>
      <p className="text-slate-300 mb-5">{description}</p>
      <span className="text-emerald-300 font-medium inline-flex items-center gap-2">
        {actionLabel} <ChevronRight className="w-4 h-4" />
      </span>
    </button>
  );
}

function KnowledgeBase() {
  const [openCategory, setOpenCategory] = useState<string>(GLOSSARY[0].category);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      GLOSSARY.map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const target = `${item.term} ${item.definition}`.toLowerCase();
          return target.includes(query.toLowerCase());
        }),
      })).filter((section) => section.items.length > 0),
    [query],
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">Knowledge Base</h2>
        <p className="text-slate-400 mt-1">High-yield domain guidance, common traps, and searchable exam terms.</p>
      </header>

      <section>
        <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-400" /> Domain Intelligence
        </h3>
        <div className="grid lg:grid-cols-2 gap-5">
          {DOMAINS.map((domain) => (
            <article key={domain.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">Domain {domain.id}: {domain.title}</h4>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300">{domain.weight}%</span>
              </div>
              <p className="text-slate-300 text-sm">{domain.description}</p>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Must Know Topics</p>
                <div className="flex flex-wrap gap-2">
                  {domain.topics.map((topic) => (
                    <span key={topic} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-emerald-300"><span className="font-semibold">Exam focus:</span> {domain.examFocus}</p>
                <p className="text-amber-300"><span className="font-semibold">Common trap:</span> {domain.commonTrap}</p>
                <p className="text-sky-300"><span className="font-semibold">Memory anchor:</span> {domain.memoryAnchor}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" /> Searchable Glossary
          </h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search term or concept"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">No matching concepts for “{query}”.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((section) => (
              <div key={section.category} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenCategory((prev) => (prev === section.category ? '' : section.category))}
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-slate-800/50"
                >
                  <span className="text-white font-semibold">{section.category}</span>
                  {openCategory === section.category ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {openCategory === section.category && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="border-t border-slate-800 p-5 space-y-4">
                        {section.items.map((item) => (
                          <div key={item.term}>
                            <h5 className="text-slate-100 font-semibold mb-1">{item.term}</h5>
                            <p className="text-sm text-slate-300 leading-relaxed">{item.definition}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FlashcardTrainer({
  mastered,
  setMastered,
  reviewQueue,
  setReviewQueue,
}: {
  mastered: Set<number>;
  setMastered: React.Dispatch<React.SetStateAction<Set<number>>>;
  reviewQueue: Set<number>;
  setReviewQueue: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [domainFilter, setDomainFilter] = useState<number | 'all'>('all');

  const deck = useMemo(() => {
    if (domainFilter === 'all') return FLASHCARDS;
    return FLASHCARDS.filter((card) => card.domain === domainFilter);
  }, [domainFilter]);

  const safeIndex = Math.min(currentIdx, Math.max(deck.length - 1, 0));
  const card = deck[safeIndex];

  const masteryPct = Math.round((mastered.size / FLASHCARDS.length) * 100);

  const next = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (deck.length === 0 ? 0 : (prev + 1) % deck.length));
  };

  const previous = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (deck.length === 0 ? 0 : (prev - 1 + deck.length) % deck.length));
  };

  const shuffleDeck = () => {
    if (deck.length <= 1) return;
    setCurrentIdx(Math.floor(Math.random() * deck.length));
    setIsFlipped(false);
  };

  const markMastered = () => {
    if (!card) return;
    setMastered((prev) => new Set(prev).add(card.id));
    setReviewQueue((prev) => {
      const nextSet = new Set(prev);
      nextSet.delete(card.id);
      return nextSet;
    });
    next();
  };

  const markReview = () => {
    if (!card) return;
    setReviewQueue((prev) => new Set(prev).add(card.id));
    setMastered((prev) => {
      const nextSet = new Set(prev);
      nextSet.delete(card.id);
      return nextSet;
    });
    next();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-white">Adaptive Flashcards</h2>
        <p className="text-slate-400 mt-2">Filter by domain, mark confidence, and build a focused review queue.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Mastery</p>
          <p className="text-2xl font-bold text-white mt-1">{masteryPct}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Review Queue</p>
          <p className="text-2xl font-bold text-white mt-1">{reviewQueue.size}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Current Deck</p>
          <p className="text-2xl font-bold text-white mt-1">{deck.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Filter className="w-4 h-4" />
          <span>Domain filter</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={domainFilter}
            onChange={(e) => {
              const value = e.target.value === 'all' ? 'all' : Number(e.target.value);
              setDomainFilter(value);
              setCurrentIdx(0);
              setIsFlipped(false);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
          >
            <option value="all">All domains</option>
            {DOMAINS.map((domain) => (
              <option key={domain.id} value={domain.id}>
                Domain {domain.id}
              </option>
            ))}
          </select>
          <button onClick={shuffleDeck} className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {card ? (
        <>
          <div className="w-full aspect-[16/10] [perspective:1100px]">
            <motion.div
              className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, type: 'spring', stiffness: 220, damping: 20 }}
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              <div className="absolute w-full h-full [backface-visibility:hidden] bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col justify-between">
                <div className="flex justify-between text-xs uppercase tracking-wide">
                  <span className="text-emerald-300">Domain {card.domain}</span>
                  {mastered.has(card.id) ? <span className="text-emerald-300">Mastered</span> : <span className="text-slate-500">Prompt</span>}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white text-center">{card.front}</h3>
                <p className="text-center text-slate-500 text-sm">Click to flip</p>
              </div>
              <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col justify-between">
                <span className="text-xs uppercase tracking-wide text-slate-400">Definition</span>
                <p className="text-xl text-slate-100 leading-relaxed">{card.back}</p>
                <p className="text-slate-500 text-sm">Click to return</p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <button onClick={previous} className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                Previous
              </button>
              <button onClick={next} className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                Next
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={markReview} className="flex items-center gap-2 px-5 py-3 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30">
                <XSquare className="w-4 h-4" /> Needs Review
              </button>
              <button onClick={markMastered} className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30">
                <CheckSquare className="w-4 h-4" /> Mastered
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">No cards in this filter.</div>
      )}
    </div>
  );
}

function ExamSimulator({ onComplete }: { onComplete: (attempt: QuizAttempt) => void }) {
  const QUESTION_COUNT_OPTIONS = [10, 30, 50, 75, 100];
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [timingMode, setTimingMode] = useState<'standard' | 'perQuestion'>('standard');
  const [secondsPerQuestion, setSecondsPerQuestion] = useState<number>(90);
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [perQuestionRemaining, setPerQuestionRemaining] = useState(secondsPerQuestion);

  useEffect(() => {
    if (!started || showResults) return;
    const timer = window.setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, showResults]);

  useEffect(() => {
    if (!started || showResults || timingMode !== 'perQuestion') return;
    if (perQuestionRemaining <= 0) {
      if (currentQuestion < examQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        finishExam();
      }
      return;
    }
    const timer = window.setTimeout(() => setPerQuestionRemaining((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, showResults, timingMode, perQuestionRemaining, currentQuestion, examQuestions.length]);

  useEffect(() => {
    if (started && timingMode === 'perQuestion') {
      setPerQuestionRemaining(secondsPerQuestion);
    }
  }, [currentQuestion, started, timingMode, secondsPerQuestion]);

  const startExam = () => {
    const set = buildExamSet(questionCount);
    setExamQuestions(set);
    setAnswers(set.map(() => null));
    setCurrentQuestion(0);
    setTimeElapsed(0);
    setShowResults(false);
    setStarted(true);
    setPerQuestionRemaining(secondsPerQuestion);
  };

  const selected = answers[currentQuestion];
  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = examQuestions.length === 0 ? 0 : Math.round((answeredCount / examQuestions.length) * 100);

  const score = useMemo(() => {
    return examQuestions.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0);
  }, [answers, examQuestions]);

  const finishExam = () => {
    if (examQuestions.length === 0) return;
    const perDomain: QuizAttempt['perDomain'] = {};
    examQuestions.forEach((q, idx) => {
      const base = perDomain[q.domain] ?? { correct: 0, total: 0 };
      base.total += 1;
      if (answers[idx] === q.answer) base.correct += 1;
      perDomain[q.domain] = base;
    });

    onComplete({
      score,
      total: examQuestions.length,
      durationSeconds: timeElapsed,
      completedAt: new Date().toISOString(),
      perDomain,
    });
    setShowResults(true);
  };

  const restart = () => {
    startExam();
  };

  const backToSetup = () => {
    setStarted(false);
    setShowResults(false);
    setExamQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setTimeElapsed(0);
  };

  if (!started) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h2 className="text-3xl font-bold text-white">Mature Exam Simulator</h2>
          <p className="text-slate-400 mt-1">
            Choose question volume and timing model. Every attempt pulls a newly randomized set and order.
          </p>
        </header>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-sm text-slate-300 mb-2">Question count</p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    questionCount === count
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950 border-slate-700 text-slate-300'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-300 mb-2">Timing mode</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTimingMode('standard')}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  timingMode === 'standard'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                Standard Timer
              </button>
              <button
                onClick={() => setTimingMode('perQuestion')}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  timingMode === 'perQuestion'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                Per-Question Timer
              </button>
            </div>
          </div>

          {timingMode === 'perQuestion' && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Seconds per question</span>
                <span className="text-slate-100 font-semibold">{secondsPerQuestion}s</span>
              </div>
              <input
                type="range"
                min={30}
                max={180}
                step={15}
                value={secondsPerQuestion}
                onChange={(e) => setSecondsPerQuestion(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          )}

          <div className="bg-slate-800/70 rounded-lg p-4 text-sm text-slate-300">
            <p>Question bank size: <span className="text-slate-100 font-semibold">{QUESTION_BANK.length}</span></p>
            <p className="mt-1">Questions are designed to be answerable from this course content or standard CISA/GRC references.</p>
          </div>

          <button
            onClick={startExam}
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-semibold"
          >
            Start Practice Exam
          </button>
        </section>
      </div>
    );
  }

  if (showResults) {
    const percent = examQuestions.length === 0 ? 0 : Math.round((score / examQuestions.length) * 100);
    const weakDomains = DOMAINS.map((domain) => {
      const inDomain = examQuestions.filter((q) => q.domain === domain.id);
      const correct = inDomain.reduce((acc, q) => {
        const idx = examQuestions.findIndex((item) => item.id === q.id);
        return acc + (answers[idx] === q.answer ? 1 : 0);
      }, 0);
      const domainScore = inDomain.length === 0 ? 0 : Math.round((correct / inDomain.length) * 100);
      return { id: domain.id, title: domain.title, score: domainScore };
    }).filter((item) => item.score > 0 || examQuestions.some((q) => q.domain === item.id)).sort((a, b) => a.score - b.score);

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center bg-emerald-500/20 text-emerald-300">
            <Award className="w-9 h-9" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2">Simulation Complete</h3>
          <p className="text-slate-400">You finished in {formatTime(timeElapsed)}</p>
          <p className="text-slate-500 text-sm mt-1">{examQuestions.length} questions · {timingMode === 'perQuestion' ? `${secondsPerQuestion}s/question mode` : 'standard timer mode'}</p>
          <p className="text-6xl font-black text-white mt-5">{percent}%</p>
          <p className="text-slate-400">{score} / {examQuestions.length} correct</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button onClick={restart} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">
              <RefreshCw className="w-4 h-4" /> New Random Exam
            </button>
            <button onClick={backToSetup} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800">
              Adjust Settings
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-white mb-4">Weak Domain Priority</h4>
            <div className="space-y-3">
              {weakDomains.map((domain) => (
                <div key={domain.id} className="bg-slate-800/70 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Domain {domain.id}</span>
                    <span className="text-slate-200">{domain.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${domain.score}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{domain.title}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-white mb-4">Missed Questions Review</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {examQuestions.map((q, idx) => {
                if (answers[idx] === q.answer) return null;
                return (
                  <details key={q.id} className="bg-slate-800/70 rounded-lg p-3 group">
                    <summary className="cursor-pointer text-sm text-slate-200 font-medium list-none flex justify-between items-center">
                      <span>Q{idx + 1} · Domain {q.domain}</span>
                      <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="mt-3 text-sm text-slate-300">{q.question}</p>
                    <p className="mt-2 text-xs text-rose-300">Your answer: {answers[idx] === null ? 'No answer' : q.options[answers[idx]!]}</p>
                    <p className="text-xs text-emerald-300">Correct answer: {q.options[q.answer]}</p>
                    <p className="mt-2 text-xs text-slate-400">{q.explanation}</p>
                  </details>
                );
              })}
              {score === examQuestions.length && (
                <p className="text-slate-300 text-sm">No missed questions. Keep this pace and increase timed difficulty.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  const q = examQuestions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">Timed Exam Simulator</h2>
        <p className="text-slate-400 mt-1">
          {timingMode === 'perQuestion'
            ? 'Per-question timer mode is active. Unanswered questions auto-advance when time expires.'
            : 'Standard timer mode is active. Answer all questions then review weak domains and distractor logic.'}
        </p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase text-slate-500 tracking-wide">Progress</p>
          <p className="text-sm text-slate-300">Question {currentQuestion + 1} of {examQuestions.length} · {answeredCount} answered</p>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-2 w-52">
            <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1">
          <div className="text-slate-300 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> {formatTime(timeElapsed)}</div>
          {timingMode === 'perQuestion' && (
            <div className={`text-sm ${perQuestionRemaining <= 15 ? 'text-rose-300' : 'text-slate-300'}`}>
              Per-question: {formatTime(perQuestionRemaining)}
            </div>
          )}
        </div>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <p className="text-xs uppercase text-emerald-300 tracking-wide mb-2">Domain {q.domain}</p>
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-6 leading-relaxed">{q.question}</h3>
        <div className="space-y-3">
          {q.options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                const next = [...answers];
                next[currentQuestion] = index;
                setAnswers(next);
              }}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                selected === index
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-100'
                  : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
          disabled={currentQuestion === 0}
          className="px-5 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-3">
          {currentQuestion < examQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion((prev) => Math.min(prev + 1, examQuestions.length - 1))}
              className="px-5 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={finishExam}
              disabled={answeredCount === 0}
              className="px-5 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 disabled:opacity-50"
            >
              Finish and Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function GrcTools() {
  const [impact, setImpact] = useState(3);
  const [likelihood, setLikelihood] = useState(3);
  const [controlMaturity, setControlMaturity] = useState(3);
  const [examDate, setExamDate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(8);

  const inherentRisk = impact * likelihood;
  const residualRisk = Math.max(1, Math.round((inherentRisk * (6 - controlMaturity)) / 5));

  const riskPriority = residualRisk >= 12 ? 'High' : residualRisk >= 7 ? 'Medium' : 'Low';

  const daysToExam = useMemo(() => {
    if (!examDate) return null;
    const now = new Date();
    const target = new Date(`${examDate}T00:00:00`);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [examDate]);

  const weeksToExam = daysToExam === null ? null : Math.max(0, Math.floor(daysToExam / 7));
  const totalHours = weeksToExam === null ? null : weeksToExam * hoursPerWeek;

  const domainHours = useMemo(() => {
    if (!totalHours) return [];
    return DOMAINS.map((domain) => ({
      id: domain.id,
      title: domain.title,
      hours: Number(((totalHours * domain.weight) / 100).toFixed(1)),
    })).sort((a, b) => b.hours - a.hours);
  }, [totalHours]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">GRC Decision Tools</h2>
        <p className="text-slate-400 mt-1">Use quant tools for risk conversations and exam planning discipline.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-300" /> Residual Risk Calculator</h3>

          <SliderRow label="Impact" value={impact} setValue={setImpact} left="Negligible" right="Severe" />
          <SliderRow label="Likelihood" value={likelihood} setValue={setLikelihood} left="Rare" right="Almost certain" />
          <SliderRow label="Control Maturity" value={controlMaturity} setValue={setControlMaturity} left="Ad hoc" right="Optimized" />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500">Inherent</p>
              <p className="text-2xl font-bold text-white">{inherentRisk}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500">Residual</p>
              <p className="text-2xl font-bold text-white">{residualRisk}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500">Priority</p>
              <p className={`text-2xl font-bold ${riskPriority === 'High' ? 'text-rose-300' : riskPriority === 'Medium' ? 'text-amber-300' : 'text-emerald-300'}`}>
                {riskPriority}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarClock className="w-5 h-5 text-sky-300" /> Exam Study Allocator</h3>

          <label className="block text-sm text-slate-300">
            Exam date
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2"
            />
          </label>

          <SliderRow label="Hours / week" value={hoursPerWeek} setValue={setHoursPerWeek} left="2" right="20" min={2} max={20} />

          <div className="bg-slate-800/80 rounded-lg p-4 text-sm text-slate-300">
            {daysToExam === null && 'Select an exam date to generate a weighted study plan.'}
            {daysToExam !== null && daysToExam < 0 && 'Exam date is in the past. Choose a future date to calculate plan.'}
            {daysToExam !== null && daysToExam >= 0 && (
              <>
                <p><span className="text-slate-100 font-semibold">Time remaining:</span> {daysToExam} days ({weeksToExam} full weeks)</p>
                <p className="mt-1"><span className="text-slate-100 font-semibold">Planned effort:</span> ~{totalHours} hours total</p>
              </>
            )}
          </div>

          {domainHours.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {domainHours.map((domain) => (
                <div key={domain.id} className="flex justify-between items-center bg-slate-800 rounded-lg p-3 text-sm">
                  <span className="text-slate-300">Domain {domain.id}</span>
                  <span className="text-slate-100 font-semibold">{domain.hours}h</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-emerald-300" /> Control Type Rapid Classifier</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {CONTROL_LIBRARY.map((control) => (
            <div key={control.name} className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3 text-sm">
              <span className="text-slate-200">{control.name}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                control.type === 'Preventive'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : control.type === 'Detective'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-amber-500/20 text-amber-300'
              }`}>
                {control.type}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ThirtyDayPlan({
  completedDays,
  setCompletedDays,
}: {
  completedDays: Set<number>;
  setCompletedDays: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [blockCompletion, setBlockCompletion] = useState<Record<number, boolean[]>>({});
  const selectedPlan = THIRTY_DAY_PLAN.find((item) => item.day === selectedDay) ?? THIRTY_DAY_PLAN[0];
  const completedCount = completedDays.size;
  const completionPct = Math.round((completedCount / THIRTY_DAY_PLAN.length) * 100);
  const daysLeft = THIRTY_DAY_PLAN.length - completedCount;
  const learningPack = DOMAIN_LEARNING_PACKS[selectedPlan.domain];
  const conceptOffset = (selectedPlan.day - 1) % Math.max(1, learningPack.concepts.length);
  const dayConcepts = [
    learningPack.concepts[conceptOffset % learningPack.concepts.length],
    learningPack.concepts[(conceptOffset + 1) % learningPack.concepts.length],
    learningPack.concepts[(conceptOffset + 2) % learningPack.concepts.length],
    learningPack.concepts[(conceptOffset + 3) % learningPack.concepts.length],
  ];
  const completedBlocks = blockCompletion[selectedPlan.day] ?? [false, false, false, false];
  const minutesDone = completedBlocks.filter(Boolean).length * 15;
  const canMarkDayComplete = completedBlocks.every(Boolean);
  const dayContext = DAY_ENRICHMENT[selectedPlan.day];

  const toggleDay = (day: number) => {
    if (day === selectedPlan.day && !canMarkDayComplete && !completedDays.has(day)) return;
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const toggleBlock = (day: number, blockIndex: number) => {
    setBlockCompletion((prev) => {
      const current = prev[day] ?? [false, false, false, false];
      const nextBlocks = [...current];
      nextBlocks[blockIndex] = !nextBlocks[blockIndex];
      return { ...prev, [day]: nextBlocks };
    });
  };

  const domainLabel = selectedPlan.domain === 0 ? 'Mixed Domains' : `Domain ${selectedPlan.domain}: ${domainById(selectedPlan.domain).title}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">30-Day CISA Master Plan</h2>
        <p className="text-slate-400 mt-1">Complete one focused module per day to cover the full exam blueprint with structured repetition.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Completed Days</p>
          <p className="text-2xl font-bold text-white mt-1">{completedCount} / 30</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Progress</p>
          <p className="text-2xl font-bold text-white mt-1">{completionPct}%</p>
          <div className="h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Days Remaining</p>
          <p className="text-2xl font-bold text-white mt-1">{daysLeft}</p>
        </div>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Pick a Day</h3>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {THIRTY_DAY_PLAN.map((item) => {
            const done = completedDays.has(item.day);
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                className={`rounded-lg px-2 py-2 text-sm border transition-colors ${
                  selectedDay === item.day
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : done
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                D{item.day}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-300">Day {selectedPlan.day}</p>
            <h3 className="text-2xl font-bold text-white">{selectedPlan.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{domainLabel}</p>
          </div>
          <button
            onClick={() => toggleDay(selectedPlan.day)}
            disabled={!canMarkDayComplete && !completedDays.has(selectedPlan.day)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
              completedDays.has(selectedPlan.day)
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-950 border-slate-700 text-slate-300 attention-btn-strong'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {completedDays.has(selectedPlan.day) ? <CheckCircle className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            {completedDays.has(selectedPlan.day) ? 'Completed' : 'Mark Complete'}
          </button>
        </div>

        <div className="bg-slate-800/70 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Objective</p>
          <p className="text-slate-200">{selectedPlan.objective}</p>
        </div>

        <div className="bg-slate-800/70 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Daily Drills</p>
          <ul className="space-y-2 text-sm text-slate-200">
            {selectedPlan.drills.map((drill) => (
              <li key={drill} className="flex gap-2">
                <span className="text-emerald-300">•</span>
                <span>{drill}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800/70 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Checkpoint</p>
          <p className="text-slate-200">{selectedPlan.checkpoint}</p>
        </div>

        <div className="bg-slate-800/70 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Real-World Example</p>
          <p className="text-slate-200">{dayContext.realWorldExample}</p>
        </div>

        <div className="bg-slate-800/70 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Deep Instructional Explanation</p>
          <p className="text-slate-200">{dayContext.deepExplanation}</p>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h3 className="text-xl font-bold text-white">60-Minute Learning Material</h3>
          <p className="text-sm text-slate-400">{minutesDone} / 60 minutes completed</p>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400" style={{ width: `${(minutesDone / 60) * 100}%` }} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800/70 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Block 1 · 15 min · Core Teaching</p>
              <button
                onClick={() => toggleBlock(selectedPlan.day, 0)}
                className={`text-xs px-2 py-1 rounded bg-slate-700 text-slate-200 ${!completedBlocks[0] ? 'attention-btn-strong' : 'button-ack'}`}
              >
                {completedBlocks[0] ? 'Done' : 'Mark'}
              </button>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              {dayConcepts.map((concept) => (
                <li key={concept} className="flex gap-2"><span className="text-emerald-300">•</span><span>{concept}</span></li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/70 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Block 2 · 15 min · Guided Practice</p>
              <button
                onClick={() => toggleBlock(selectedPlan.day, 1)}
                className={`text-xs px-2 py-1 rounded bg-slate-700 text-slate-200 ${!completedBlocks[1] ? 'attention-btn-strong' : 'button-ack'}`}
              >
                {completedBlocks[1] ? 'Done' : 'Mark'}
              </button>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              {selectedPlan.drills.map((drill) => (
                <li key={drill} className="flex gap-2"><span className="text-emerald-300">•</span><span>{drill}</span></li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/70 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Block 3 · 15 min · Scenario Lab</p>
              <button
                onClick={() => toggleBlock(selectedPlan.day, 2)}
                className={`text-xs px-2 py-1 rounded bg-slate-700 text-slate-200 ${!completedBlocks[2] ? 'attention-btn-strong' : 'button-ack'}`}
              >
                {completedBlocks[2] ? 'Done' : 'Mark'}
              </button>
            </div>
            <p className="text-sm text-slate-200 mb-3"><span className="font-semibold text-slate-100">Scenario:</span> {learningPack.scenarioPrompt}</p>
            <p className="text-sm text-emerald-200"><span className="font-semibold">Best-answer logic:</span> {learningPack.scenarioAnswer}</p>
          </div>

          <div className="bg-slate-800/70 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Block 4 · 15 min · Knowledge Check</p>
              <button
                onClick={() => toggleBlock(selectedPlan.day, 3)}
                className={`text-xs px-2 py-1 rounded bg-slate-700 text-slate-200 ${!completedBlocks[3] ? 'attention-btn-strong' : 'button-ack'}`}
              >
                {completedBlocks[3] ? 'Done' : 'Mark'}
              </button>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              {learningPack.knowledgeChecks.map((check) => (
                <li key={check} className="flex gap-2"><span className="text-emerald-300">•</span><span>{check}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {!canMarkDayComplete && !completedDays.has(selectedPlan.day) && (
          <p className="text-xs text-amber-300">
            Complete all four 15-minute blocks before marking this day complete.
          </p>
        )}
      </section>

      {completedCount === THIRTY_DAY_PLAN.length && (
        <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-emerald-200 mb-2">30-Day Plan Complete</h3>
          <p className="text-emerald-100/90">
            You have finished all 30 modules and covered all core CISA domains with mixed review and full mock practice. Keep rotating quiz + flashcards to maintain retention until exam day.
          </p>
        </section>
      )}
    </div>
  );
}

function AiStudyAssistant() {
  const [provider, setProvider] = useState<ChatProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaApiKey, setOllamaApiKey] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'I can help with CISA prep, domain explanations, practice rationale, and 30-day study planning. Ask me anything from this course.',
    },
  ]);

  useEffect(() => {
    const storedProvider = localStorage.getItem('ai_provider') as ChatProvider | null;
    const storedKey = localStorage.getItem('ai_api_key');
    const storedModel = localStorage.getItem('ai_model');
    const storedOllamaUrl = localStorage.getItem('ai_ollama_url');
    const storedOllamaApiKey = localStorage.getItem('ai_ollama_api_key');
    if (storedProvider) setProvider(storedProvider);
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setModel(storedModel);
    if (storedOllamaUrl) setOllamaUrl(storedOllamaUrl);
    if (storedOllamaApiKey) setOllamaApiKey(storedOllamaApiKey);
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_ollama_url', ollamaUrl);
    localStorage.setItem('ai_ollama_api_key', ollamaApiKey);
  }, [provider, model, ollamaUrl, ollamaApiKey]);

  const providerDefaults: Record<ChatProvider, string> = {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-1.5-flash',
    ollama: 'llama3.1',
  };

  const systemPrompt =
    'You are a CISA exam prep tutor. Keep responses concise, exam-focused, and aligned to IS audit, governance, SDLC, operations resilience, and security protection.';

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey.trim() && provider !== 'ollama') {
      setError('API key is required for OpenAI and Gemini.');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsLoading(true);
    localStorage.setItem('ai_api_key', apiKey);

    try {
      let assistantText = '';

      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...nextMessages.map((message) => ({ role: message.role, content: message.content })),
            ],
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error?.message ?? 'OpenAI request failed.');
        }
        assistantText = data?.choices?.[0]?.message?.content ?? 'No response returned.';
      } else if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: nextMessages.map((message) => ({
                role: message.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: message.content }],
              })),
            }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error?.message ?? 'Gemini request failed.');
        }
        assistantText =
          data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('\n') || 'No response returned.';
      } else {
        const normalizedUrl = ollamaUrl.replace(/\/$/, '');
        const ollamaHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (ollamaApiKey.trim()) ollamaHeaders.Authorization = `Bearer ${ollamaApiKey}`;
        const response = await fetch(`${normalizedUrl}/api/chat`, {
          method: 'POST',
          headers: ollamaHeaders,
          body: JSON.stringify({
            model,
            stream: false,
            messages: [
              { role: 'system', content: systemPrompt },
              ...nextMessages.map((message) => ({ role: message.role, content: message.content })),
            ],
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Ollama request failed.');
        }
        assistantText = data?.message?.content ?? 'No response returned.';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Request failed.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">AI Study Assistant</h2>
        <p className="text-slate-400 mt-1">
          Connect your own OpenAI, Gemini, or Ollama key to get explanations, study coaching, and scenario walkthroughs.
        </p>
      </header>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="text-sm text-slate-300">
            Provider
            <select
              value={provider}
              onChange={(event) => {
                const nextProvider = event.target.value as ChatProvider;
                setProvider(nextProvider);
                setModel(providerDefaults[nextProvider]);
              }}
              className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="ollama">Ollama</option>
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Model
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2"
              placeholder={providerDefaults[provider]}
            />
          </label>

          <label className="text-sm text-slate-300">
            {provider === 'ollama' ? 'Ollama URL' : 'API key'}
            <input
              value={provider === 'ollama' ? ollamaUrl : apiKey}
              onChange={(event) => (provider === 'ollama' ? setOllamaUrl(event.target.value) : setApiKey(event.target.value))}
              type={provider === 'ollama' ? 'text' : 'password'}
              className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2"
              placeholder={provider === 'ollama' ? 'http://localhost:11434' : 'Enter API key'}
            />
          </label>
        </div>
        {provider === 'ollama' && (
          <label className="text-sm text-slate-300 block">
            Ollama API key (optional)
            <input
              value={ollamaApiKey}
              onChange={(event) => setOllamaApiKey(event.target.value)}
              type="password"
              className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2"
              placeholder="Leave blank if your Ollama server has no auth"
            />
          </label>
        )}
        {provider !== 'ollama' && (
          <p className="text-xs text-slate-500">
            Your API key is stored locally in this browser for convenience.
          </p>
        )}
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-slate-200">
          <Bot className="w-4 h-4 text-emerald-300" />
          <span className="font-medium">CISA Tutor Chat</span>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'assistant'
                  ? 'bg-slate-800 text-slate-200 mr-6'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 ml-6'
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="rounded-xl px-4 py-3 text-sm bg-slate-800 text-slate-300 mr-6">
              Thinking...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about any CISA domain, missed question, or study strategy..."
              className="flex-1 min-h-24 sm:min-h-14 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 resize-y"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="sm:self-end inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          {error && <p className="text-xs text-rose-300 mt-2">{error}</p>}
        </div>
      </section>
    </div>
  );
}

function SliderRow({
  label,
  value,
  setValue,
  left,
  right,
  min = 1,
  max = 5,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  left: string;
  right: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-100 font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    const storedTheme = localStorage.getItem('theme_mode') as ThemeMode | null;
    return storedTheme ?? 'dark';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [reviewQueue, setReviewQueue] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const averageQuiz = useMemo(() => {
    if (attempts.length === 0) return 0;
    const pct = attempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / attempts.length;
    return Math.round(pct);
  }, [attempts]);

  const domainAccuracy = useMemo(() => {
    const aggregate: Record<number, { correct: number; total: number }> = {};
    attempts.forEach((attempt) => {
      Object.entries(attempt.perDomain).forEach(([id, stats]) => {
        const domainId = Number(id);
        const base = aggregate[domainId] ?? { correct: 0, total: 0 };
        base.correct += stats.correct;
        base.total += stats.total;
        aggregate[domainId] = base;
      });
    });

    return DOMAINS.map((domain) => {
      const stats = aggregate[domain.id];
      const accuracy = !stats || stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
      return { id: domain.id, title: domain.title, accuracy, weight: domain.weight };
    });
  }, [attempts]);

  const focusDomains = useMemo(() => {
    return domainAccuracy
      .map((domain) => {
        const weightedNeed = Math.round((domain.weight / 100) * (100 - domain.accuracy));
        return { id: domain.id, title: domain.title, gap: weightedNeed };
      })
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 4);
  }, [domainAccuracy]);

  const readinessScore = useMemo(() => {
    const masteryPct = (mastered.size / FLASHCARDS.length) * 100;
    const consistencyPct = Math.min(100, attempts.length * 20);
    const score = masteryPct * 0.45 + averageQuiz * 0.45 + consistencyPct * 0.1;
    return Math.round(score);
  }, [mastered.size, averageQuiz, attempts.length]);

  useEffect(() => {
    localStorage.setItem('theme_mode', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest('button');
      if (!button) return;
      button.classList.add('button-ack');
    };
    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex selection:bg-emerald-300 selection:text-slate-950 ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        readinessScore={readinessScore}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="md:hidden bg-slate-950 border-b border-slate-800 text-white p-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            aria-label="Go to home dashboard"
          >
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="font-bold">CISA Pass Lab</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsMobileOpen(true)} className="p-2 -mr-2 text-slate-300 hover:text-white" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto pb-24">
            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={setActiveTab}
                readinessScore={readinessScore}
                masteredCount={mastered.size}
                averageQuiz={averageQuiz}
                attempts={attempts.length}
                focusDomains={focusDomains}
              />
            )}
            {activeTab === 'thirtyday' && <ThirtyDayPlan completedDays={completedDays} setCompletedDays={setCompletedDays} />}
            {activeTab === 'knowledge' && <KnowledgeBase />}
            {activeTab === 'flashcards' && (
              <FlashcardTrainer
                mastered={mastered}
                setMastered={setMastered}
                reviewQueue={reviewQueue}
                setReviewQueue={setReviewQueue}
              />
            )}
            {activeTab === 'quiz' && <ExamSimulator onComplete={(attempt) => setAttempts((prev) => [...prev, attempt])} />}
            {activeTab === 'tools' && <GrcTools />}
            {activeTab === 'ai' && <AiStudyAssistant />}
          </div>
        </main>
      </div>
    </div>
  );
}
