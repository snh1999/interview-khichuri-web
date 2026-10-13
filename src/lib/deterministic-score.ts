import type { IJob, TJobWorkType } from "@/api/jobs";
import type { TProfilePopulated } from "@/api/profile";

export const LEVEL_ORDER = [
  "junior",
  "mid",
  "senior",
  "lead",
  "executive",
] as const;

export type TLevel = (typeof LEVEL_ORDER)[number];

export type TGrade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface TFacts {
  skillIds: number[];
  roleIds: number[];
  seniority: TLevel | null;
  yearsOfExperience?: number | null;
  salaryLower?: number | null;
  salaryExpected?: number | null;
  currency?: string | null;
  preferredLocation?: string | null;
  workType?: TJobWorkType | null;
}

export interface IScoreDimension {
  key: string;
  title: string;
  score: number | null;
  weight: number;
  detail?: string;
}

export interface TDeterministicScore {
  overall: number;
  grade: TGrade;
  sections: IScoreDimension[];
  hasSignal: boolean;
}

// Weights sum to 100 so `weightSum >= MIN_SIGNAL_WEIGHT` reads as a percentage
// of the model actually exercised by available data.
const WEIGHTS = {
  skills: 45,
  seniority: 25,
  workType: 15,
  location: 8,
  role: 7,
};

// A score only renders when present dimensions cover ~40% of the model. Skills
// are null on every list row, so the bar is 40% of the non-skill weight
// (100 - 45 = 55): 22.
const MIN_SIGNAL_WEIGHT = 22;

const SALARY_BONUS_MAX = 5;

const SALARY_PENALTY_MAX = 20;

const LOCATION_SPLIT = /[^a-z]+/;

const MIN_LOCATION_TOKEN = 4;

// Inlined (subset) of career-ops classify-tier.mjs, mapped onto the app's five
// levels. LEFTMOST marker wins. No marker -> null, never "mid": defaulting
// manufactures a match (career-ops' mid default is for scan filtering).
// Multi-word qualifier+rank titles (associate director) sit before the bare
// qualifier so the rank wins the tie at index 0.
const SENIORITY_MARKERS: ReadonlyArray<readonly [RegExp, TLevel]> = [
  [/\bchief\b/i, "executive"],
  [/\bvice\s+president\b/i, "executive"],
  [/\bvp\b/i, "executive"],
  [/\bdirector\b/i, "executive"],
  [/\bhead\s+of\b/i, "executive"],
  [/\bassociate\s+director\b/i, "executive"],
  [/\bprincipal\b/i, "lead"],
  [/\bstaff\b/i, "lead"],
  [/\blead\b/i, "lead"],
  [/\bsenior\b/i, "senior"],
  [/\bsr\.?\b/i, "senior"],
  [/\bl6\b/i, "senior"],
  [/\bmid-level\b/i, "mid"],
  [/\bmid\b/i, "mid"],
  [/\bii\b/i, "mid"],
  [/\bl3\b/i, "mid"],
  [/\bl4\b/i, "mid"],
  [/\bl5\b/i, "mid"],
  [/\bentry-level\b/i, "junior"],
  [/\bentry\b/i, "junior"],
  [/\bassociate\b/i, "junior"],
  [/\bjunior\b/i, "junior"],
  [/\bl1\b/i, "junior"],
  [/\bl2\b/i, "junior"],
  [/\binternship\b/i, "junior"],
  [/\bintern\b/i, "junior"],
  [/\btrainee\b/i, "junior"],
  [/\bco-op\b/i, "junior"],
];

const bandScore = (d: number): number => {
  if (d === 0) {
    return 100;
  }
  if (d === 1) {
    return 70;
  }
  if (d === 2) {
    return 40;
  }
  return 10;
};

const matchDetail = (
  score: number | null,
  labels: { match: string; miss: string }
): string | undefined => {
  if (score === null) {
    return undefined;
  }
  return score === 100 ? labels.match : labels.miss;
};

const gradeFrom = (score: number): TGrade => {
  if (score >= 90) {
    return "A+";
  }
  if (score >= 80) {
    return "A";
  }
  if (score >= 70) {
    return "B";
  }
  if (score >= 60) {
    return "C";
  }
  if (score >= 50) {
    return "D";
  }
  return "F";
};

// workType scores only when both sides state one: exact match -> 100, mismatch
// -> 0, absent on either side -> null (weight redistributes).
const matchWorkType = (
  preferred?: TJobWorkType | null,
  offered?: TJobWorkType | null
): number | null => {
  if (!(preferred && offered)) {
    return null;
  }
  return preferred === offered ? 100 : 0;
};

// Location is a text-token heuristic and only runs for non-remote arrangements
// (remote is scored by workType, so location is null then — scoring it too
// would double-count the arrangement). City vs country ("Berlin" vs "Germany")
// stays a token mismatch; acceptable at this weight.
const matchLocation = (
  preferred?: string | null,
  offered?: string | null
): number | null => {
  if (!(preferred && offered)) {
    return null;
  }
  const preferredTokens = preferred
    .toLowerCase()
    .split(LOCATION_SPLIT)
    .filter((token) => token.length >= MIN_LOCATION_TOKEN);
  const offeredTokens = offered
    .toLowerCase()
    .split(LOCATION_SPLIT)
    .filter((token) => token.length >= MIN_LOCATION_TOKEN);
  if (preferredTokens.length === 0 || offeredTokens.length === 0) {
    return null;
  }
  return preferredTokens.some((token) => offeredTokens.includes(token))
    ? 100
    : 0;
};

const currenciesComparable = (
  jobCurrency?: string | null,
  candidateCurrency?: string | null
): boolean => (jobCurrency ?? null) === (candidateCurrency ?? null);

// A stated lower/upper pair is a range; a lone bound is treated as a fixed
// point on both sides so "from 80k" is not read as an 80k ceiling.
const toSalaryPoint = (
  lower?: number | null,
  upper?: number | null
): readonly [number, number] | null => {
  const hasLower = typeof lower === "number";
  const hasUpper = typeof upper === "number";
  if (hasLower && hasUpper) {
    return [lower, upper];
  }
  if (hasLower) {
    return [lower, lower];
  }
  if (hasUpper) {
    return [upper, upper];
  }
  return null;
};

export const classifyLevelFromTitle = (
  title?: string | null
): TLevel | null => {
  if (!title) {
    return null;
  }
  let best: TLevel | null = null;
  let bestIndex = Number.POSITIVE_INFINITY;
  for (const [pattern, level] of SENIORITY_MARKERS) {
    const index = title.search(pattern);
    if (index >= 0 && index < bestIndex) {
      best = level;
      bestIndex = index;
    }
  }
  return best;
};

const EMPTY_FACTS: TFacts = {
  roleIds: [],
  seniority: null,
  skillIds: [],
  workType: null,
  yearsOfExperience: null,
};

export const profileFacts = (profile?: TProfilePopulated | null): TFacts => {
  if (!profile) {
    return EMPTY_FACTS;
  }
  const overviews = profile.workOverviews ?? [];
  const preference = profile.jobPreferences?.[0];
  return {
    currency: preference?.currency ?? null,
    preferredLocation: preference?.preferredLocation ?? null,
    roleIds: (preference?.titles ?? []).map((title) => title.roleId),
    salaryExpected: preference?.salaryExpected ?? null,
    salaryLower: preference?.salaryLower ?? null,
    seniority: (overviews[0]?.experienceLevel as TLevel | undefined) ?? null,
    skillIds: overviews.flatMap((overview) =>
      (overview.skills ?? []).map((skill) => skill.topicId)
    ),
    workType: preference?.workType ?? null,
    yearsOfExperience: overviews[0]?.yearsOfExperience ?? null,
  };
};

// Signed modifier, not a dimension: a dimension can only add, so "deduct up to
// 20" has to live outside the weighted mean. The job's reachable top is
// compared against the candidate band: reaching it earns +5, reaching the floor
// a proportional slice, and falling short of the floor slides to -20. Missing
// salary data forfeits the +5 — that absence *is* the penalty.
const salaryAdjustment = (facts: TFacts, job: IJob): number => {
  if (!currenciesComparable(job.currency, facts.currency)) {
    return 0;
  }
  const jobRange = toSalaryPoint(job.salaryLower, job.salaryUpper);
  const candidateRange = toSalaryPoint(facts.salaryLower, facts.salaryExpected);
  if (!(jobRange && candidateRange)) {
    return 0;
  }
  const [, jobTop] = jobRange;
  const [anchor, top] = candidateRange;
  if (jobTop >= top) {
    return SALARY_BONUS_MAX;
  }
  if (jobTop >= anchor) {
    return Math.round(
      (SALARY_BONUS_MAX * (jobTop - anchor)) / Math.max(1, top - anchor)
    );
  }
  const span = top - anchor || Math.max(1, anchor);
  const below = anchor - jobTop;
  // ponytail: linear -20 cap once the offer sits a full band below the floor;
  // upgrade to a steeper curve if shortfalls should bite harder.
  return -Math.round(Math.min(1, below / span) * SALARY_PENALTY_MAX);
};

// Requirement vs the candidate's years. Under-qualification (below the stated
// lower bound) bites; over-qualification is scored mildly — the requirement is
// a floor, so exceeding it is not really a fit failure.
const YEARS_UNDER = [100, 85, 60, 35, 15] as const;

const YEARS_OVER = [100, 90, 80, 65, 50] as const;

const yearsBandScore = (facts: TFacts, job: IJob): number | null => {
  const required = job.experienceRequired;
  const actual = facts.yearsOfExperience;
  if (typeof required !== "number" || typeof actual !== "number") {
    return null;
  }
  const gap = required - actual;
  const table = gap > 0 ? YEARS_UNDER : YEARS_OVER;
  return table[Math.min(Math.abs(gap), table.length - 1)];
};

const roleScore = (facts: TFacts, job: IJob): number | null => {
  if (typeof job.roleId !== "number" || facts.roleIds.length === 0) {
    return null;
  }
  return facts.roleIds.includes(job.roleId) ? 100 : 0;
};

export const scoreJob = (facts: TFacts, job: IJob): TDeterministicScore => {
  const results: IScoreDimension[] = [];

  // skills: match the job's own topic tags against the candidate's topic IDs.
  // Coverage of the job's distinct skills; null when either side lists none.
  const jobSkillIds = new Set(job.topicIds ?? []);
  const candidateSkillIds = new Set(facts.skillIds);
  let skillsScore: number | null = null;
  if (jobSkillIds.size > 0 && candidateSkillIds.size > 0) {
    let hits = 0;
    for (const id of jobSkillIds) {
      if (candidateSkillIds.has(id)) {
        hits += 1;
      }
    }
    skillsScore = Math.round((hits / jobSkillIds.size) * 100);
  }
  results.push({
    key: "skills",
    score: skillsScore,
    title: "Skills",
    weight: WEIGHTS.skills,
  });

  // seniority: title band and years band, averaged when both are present.
  const jobLevel = classifyLevelFromTitle(job.title);
  const titleScore =
    facts.seniority && jobLevel
      ? bandScore(
          Math.abs(
            LEVEL_ORDER.indexOf(facts.seniority) - LEVEL_ORDER.indexOf(jobLevel)
          )
        )
      : null;
  const yearsScore = yearsBandScore(facts, job);
  let seniorityScore: number | null = null;
  let seniorityDetail: string | undefined;
  if (titleScore !== null && yearsScore !== null) {
    seniorityScore = Math.round((titleScore + yearsScore) / 2);
    seniorityDetail = "title + years";
  } else if (titleScore !== null) {
    seniorityScore = titleScore;
    seniorityDetail = "title";
  } else if (yearsScore !== null) {
    seniorityScore = yearsScore;
    seniorityDetail = "years";
  }
  results.push({
    detail: seniorityDetail,
    key: "seniority",
    score: seniorityScore,
    title: "Seniority",
    weight: WEIGHTS.seniority,
  });

  const workTypeScore = matchWorkType(facts.workType, job.workType);
  results.push({
    detail: matchDetail(workTypeScore, {
      match: "match",
      miss: "mismatch",
    }),
    key: "workType",
    score: workTypeScore,
    title: "Work Type",
    weight: WEIGHTS.workType,
  });

  const locationScore =
    job.workType === "remote" || facts.workType === "remote"
      ? null
      : matchLocation(facts.preferredLocation, job.location);
  results.push({
    detail: matchDetail(locationScore, {
      match: "match",
      miss: "no overlap",
    }),
    key: "location",
    score: locationScore,
    title: "Location",
    weight: WEIGHTS.location,
  });

  const role = roleScore(facts, job);
  results.push({
    detail: matchDetail(role, { match: "match", miss: "different role" }),
    key: "role",
    score: role,
    title: "Role",
    weight: WEIGHTS.role,
  });

  let sum = 0;
  let weightSum = 0;
  for (const result of results) {
    if (result.score !== null) {
      sum += result.score * result.weight;
      weightSum += result.weight;
    }
  }
  const base = weightSum > 0 ? sum / weightSum : 0;
  const adjusted =
    (base * (100 - SALARY_BONUS_MAX)) / 100 + salaryAdjustment(facts, job);

  const overall = Math.max(0, Math.min(100, Math.round(adjusted)));

  return {
    grade: gradeFrom(overall),
    hasSignal: weightSum >= MIN_SIGNAL_WEIGHT,
    overall,
    sections: results,
  };
};

export { gradeFrom };
