import {
  type AnalysisResult,
  type GoalPriority,
  type MissingInfo,
  type PlanningDirection,
  type QuestionnaireData,
  type RecommendationTheme,
  type Tradeoff,
  systemPrompt,
} from "@/lib/questionnaire";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function toNumber(value: string) {
  const normalized = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : 0;
}

function householdName(data: QuestionnaireData) {
  const c1 = data.clients.client1.fullName || "Client 1";
  const c2 = data.clients.client2.fullName || "Client 2";
  return `${c1} & ${c2}`;
}

function totalIncome(data: QuestionnaireData) {
  return toNumber(data.clients.client1.annualEarnedIncome) + toNumber(data.clients.client2.annualEarnedIncome);
}

function totalLiquidAssets(data: QuestionnaireData) {
  return data.assets.bankAccounts.reduce((sum, account) => sum + toNumber(account.averageBalance), 0);
}

function totalRetirementAssets(data: QuestionnaireData) {
  return data.assets.retirementAccounts.reduce((sum, account) => sum + toNumber(account.value), 0);
}

function totalOtherInvestableAssets(data: QuestionnaireData) {
  return data.assets.certificatesOfDeposit.reduce((sum, item) => sum + toNumber(item.value), 0)
    + data.assets.otherAccounts.reduce((sum, item) => sum + toNumber(item.value), 0);
}

function totalDebtBalance(data: QuestionnaireData) {
  return [
    data.liabilities.client1.creditCardMonthlyPaymentBalance,
    data.liabilities.client1.residenceLoanMonthlyPaymentBalance,
    data.liabilities.client1.autoLoanMonthlyPaymentBalance,
    data.liabilities.client1.otherDebtMonthlyPaymentBalance,
    data.liabilities.client2.creditCardMonthlyPaymentBalance,
    data.liabilities.client2.residenceLoanMonthlyPaymentBalance,
    data.liabilities.client2.autoLoanMonthlyPaymentBalance,
    data.liabilities.client2.otherDebtMonthlyPaymentBalance,
  ].reduce((sum, item) => sum + toNumber(item), 0);
}

function dependentCount(data: QuestionnaireData) {
  return data.dependents.filter((item) => item.name || item.relationship || item.dateOfBirth).length;
}

function inferLifeStage(data: QuestionnaireData) {
  const deps = dependentCount(data);
  const birthYears = [data.clients.client1.birthDate, data.clients.client2.birthDate]
    .map((date) => Number(date.slice(0, 4)))
    .filter((year) => Number.isFinite(year) && year > 1900);

  if (deps > 0) {
    return {
      label: "Family-building",
      reasoning: "The intake shows one or more dependents and shared household planning needs.",
    };
  }

  if (birthYears.length) {
    const avgAge = birthYears.reduce((sum, year) => sum + (new Date().getFullYear() - year), 0) / birthYears.length;
    if (avgAge >= 55) {
      return {
        label: "Pre-retirement",
        reasoning: "The reported birth dates suggest a later-career household.",
      };
    }
  }

  return {
    label: "Accumulation stage",
    reasoning: "The intake does not show a clearer life stage, so this is treated as an accumulation household by default.",
  };
}

function explicitGoals(data: QuestionnaireData) {
  const goals: string[] = [];
  const text = `${data.adviceSought} ${data.currentAdvisors.attorney} ${data.currentAdvisors.accountant}`.toLowerCase();

  if (/retire|retirement/.test(text)) goals.push("Retirement readiness");
  if (/college|education|child/.test(text)) goals.push("Education funding");
  if (/insurance|protect/.test(text)) goals.push("Protection planning");
  if (/estate|will|trust/.test(text)) goals.push("Estate planning basics");
  if (/debt|cash flow|cashflow/.test(text)) goals.push("Debt and cash-flow management");

  return goals;
}

function buildPriorities(data: QuestionnaireData): GoalPriority[] {
  const priorities: GoalPriority[] = [];
  const income = totalIncome(data);
  const debts = totalDebtBalance(data);
  const liquid = totalLiquidAssets(data);
  const deps = dependentCount(data);
  const goals = explicitGoals(data);

  if (deps > 0) {
    priorities.push({
      goal: "Protect household income",
      priority: "high",
      reason: "The intake shows dependents, making income protection and contingency planning foundational.",
    });
  }

  const disabilityMissing = [data.insurance.client1, data.insurance.client2].some((profile) => !profile.disabilityCompany && /no|none/i.test(profile.disabilityCoverageCost || ""));
  if (disabilityMissing) {
    priorities.push({
      goal: "Review disability coverage",
      priority: "high",
      reason: "The intake suggests at least one client lacks disability protection despite relying on earned income.",
    });
  }

  if (income > 0 && debts / income > 1.5) {
    priorities.push({
      goal: "Reduce debt pressure",
      priority: "high",
      reason: "Debt balances appear large relative to annual earned income, which can crowd out other goals.",
    });
  }

  if (liquid < income * 0.15) {
    priorities.push({
      goal: "Strengthen liquidity reserves",
      priority: "high",
      reason: "Reported liquid balances appear modest relative to income and family obligations.",
    });
  }

  for (const goal of goals) {
    priorities.push({
      goal,
      priority: "medium",
      reason: "This goal is explicitly or implicitly reflected in the client’s stated advice request.",
    });
  }

  if ([data.estateIssues.client1, data.estateIssues.client2].some((item) => !item.currentWill || !item.medicalPowerOfAttorney || !item.generalPowerOfAttorney)) {
    priorities.push({
      goal: "Complete estate basics",
      priority: "high",
      reason: "The estate issues section indicates missing wills or powers of attorney.",
    });
  }

  const deduped = new Map<string, GoalPriority>();
  for (const item of priorities) {
    if (!deduped.has(item.goal)) deduped.set(item.goal, item);
  }

  return Array.from(deduped.values()).sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  });
}

function buildTradeoffs(data: QuestionnaireData): Tradeoff[] {
  const items: Tradeoff[] = [];
  const goals = explicitGoals(data);
  const income = totalIncome(data);
  const debt = totalDebtBalance(data);
  const liquid = totalLiquidAssets(data);

  if (goals.includes("Retirement readiness") && goals.includes("Education funding")) {
    items.push({
      goal1: "Retirement readiness",
      goal2: "Education funding",
      detail: "The same future cash flow may need to support both retirement savings and dependent-related education goals.",
    });
  }

  if (debt > income) {
    items.push({
      goal1: "Debt reduction",
      goal2: "Long-term accumulation",
      detail: "High debt balances may limit the household’s ability to fund retirement, insurance, and education goals simultaneously.",
    });
  }

  if (liquid < income * 0.15) {
    items.push({
      goal1: "Liquidity reserves",
      goal2: "Investment acceleration",
      detail: "The household may need to prioritize emergency reserves before stretching toward more aggressive long-term funding targets.",
    });
  }

  return items;
}

function buildStrengths(data: QuestionnaireData): string[] {
  const strengths: string[] = [];
  const income = totalIncome(data);
  const retirement = totalRetirementAssets(data);
  const investable = totalOtherInvestableAssets(data);
  const docs = Object.values(data.supportingDocuments).filter(Boolean).length;

  if (income >= 200000) strengths.push("Combined earned income suggests the household may have planning flexibility once priorities are sequenced.");
  if (retirement > 0) strengths.push("The intake shows existing retirement assets, which provides a base for longer-term planning.");
  if (investable > 0) strengths.push("The household has investable assets outside retirement accounts that can inform liquidity and opportunity analysis.");
  if (docs >= 4) strengths.push("The document checklist suggests the household can support a relatively efficient discovery and analysis process.");
  if (data.currentAdvisors.accountant) strengths.push("An existing accountant relationship may help with coordinated implementation and tax-aware planning.");

  return strengths.length ? strengths : ["The intake includes enough baseline data to support a more substantive discovery conversation than a product-only fact find."];
}

function buildRisks(data: QuestionnaireData): string[] {
  const risks: string[] = [];
  const estateMissing = [data.estateIssues.client1, data.estateIssues.client2].some((item) => !item.currentWill || !item.medicalPowerOfAttorney || !item.generalPowerOfAttorney);
  const debt = totalDebtBalance(data);
  const income = totalIncome(data);
  const docsMissing = Object.entries(data.supportingDocuments).filter(([, present]) => !present).map(([key]) => key);

  const lifeGaps = [data.insurance.client1.lifeTypeCoverageCost, data.insurance.client2.lifeTypeCoverageCost].some((value) => !value || /none|no/i.test(value));
  const disabilityGaps = [data.insurance.client1.disabilityCoverageCost, data.insurance.client2.disabilityCoverageCost].some((value) => !value || /none|no/i.test(value));
  const umbrellaGaps = [data.insurance.client1.umbrellaLiabilityTypeCoverageCost, data.insurance.client2.umbrellaLiabilityTypeCoverageCost].some((value) => !value || /none|no/i.test(value));

  if (lifeGaps) risks.push("The insurance section suggests life coverage may be absent or incomplete for at least one client.");
  if (disabilityGaps) risks.push("The insurance section suggests disability protection may be missing despite reliance on earned income.");
  if (umbrellaGaps) risks.push("No clear umbrella liability coverage is shown, which may matter for a household with real estate, autos, and dependents.");
  if (estateMissing) risks.push("Estate basics appear incomplete, increasing family and implementation risk if incapacity or death occurs.");
  if (income > 0 && debt / income > 1.5) risks.push("Debt levels appear heavy relative to earned income, which may reduce flexibility across multiple goals.");
  if (docsMissing.length >= 3) risks.push("Several supporting documents are not yet available, which may limit the quality of planning recommendations until collected.");

  return risks.length ? risks : ["No single catastrophic gap is obvious from the intake alone, but the advisor should still validate each section with source documents."];
}

function buildDirections(): PlanningDirection[] {
  return [
    {
      name: "Foundation-first path",
      summary: "Stabilize protection, estate basics, liquidity, and document completeness before making large strategic allocation changes.",
      advantages: [
        "Reduces fragility if income disruption, disability, or family emergencies occur.",
        "Improves the reliability of later recommendations because the fact base is cleaner.",
      ],
      drawbacks: [
        "May delay more aspirational goals such as accelerated investing or education pre-funding.",
      ],
    },
    {
      name: "Parallel progress path",
      summary: "Address protection gaps while continuing retirement and other goal funding through staged contribution targets and debt decisions.",
      advantages: [
        "Maintains momentum across multiple client-valued objectives.",
        "Fits households with stronger income capacity and willingness to monitor trade-offs closely.",
      ],
      drawbacks: [
        "Requires tighter cash-flow discipline and more explicit sequencing decisions.",
      ],
    },
  ];
}

function buildThemes(data: QuestionnaireData): RecommendationTheme[] {
  const themes: RecommendationTheme[] = [
    {
      theme: "Use the full household fact pattern before recommendations",
      urgency: "high",
      whyItMatters: "This intake includes clients, dependents, assets, insurance, liabilities, estate issues, and advisor relationships; recommendations should integrate all of them together.",
    },
    {
      theme: "Clarify priority order among competing goals",
      urgency: "high",
      whyItMatters: "The advice request and family structure imply simultaneous goals that likely compete for the same resources.",
    },
  ];

  if ([data.estateIssues.client1, data.estateIssues.client2].some((item) => !item.currentWill)) {
    themes.push({
      theme: "Address estate-document gaps early",
      urgency: "high",
      whyItMatters: "Missing wills and powers of attorney can create immediate non-investment planning risk.",
    });
  }

  if ([data.insurance.client1.disabilityCoverageCost, data.insurance.client2.disabilityCoverageCost].some((value) => !value || /none|no/i.test(value))) {
    themes.push({
      theme: "Pressure-test income protection assumptions",
      urgency: "high",
      whyItMatters: "The household depends on earned income, and at least one disability coverage field appears weak or absent.",
    });
  }

  return themes;
}

function buildMissingInfo(data: QuestionnaireData): MissingInfo[] {
  const missing: MissingInfo[] = [];
  const add = (condition: boolean, item: string, whyNeeded: string) => {
    if (condition) missing.push({ item, whyNeeded });
  };

  add(!data.clients.client1.fullName, "Client 1 full name", "The first client profile is incomplete.");
  add(!data.clients.client2.fullName, "Client 2 full name", "The second client profile is incomplete.");
  add(!data.clients.client1.annualEarnedIncome || !data.clients.client2.annualEarnedIncome, "Earned income for both clients", "A household-level analysis is weaker if one client’s income is missing.");
  add(!data.assets.bankAccounts.some((item) => item.accountNumberType || item.averageBalance), "Bank account details", "Liquidity and cash reserve analysis depend on liquid account balances.");
  add(!data.assets.retirementAccounts.some((item) => item.value), "Retirement account values", "Retirement readiness and opportunity-cost analysis depend on known account values.");
  add(!data.liabilities.client1.residenceLoanMonthlyPaymentBalance && !data.liabilities.client2.residenceLoanMonthlyPaymentBalance, "Residence loan details", "Mortgage obligations influence liquidity, debt burden, and insurance needs.");
  add(!data.adviceSought, "Comment on advice being sought", "The planner needs the clients’ own framing of what they want solved now.");

  return missing;
}

export function buildFallbackAnalysis(data: QuestionnaireData): AnalysisResult {
  const lifeCycleStage = inferLifeStage(data);
  const household = householdName(data);
  const income = totalIncome(data);
  const liquid = totalLiquidAssets(data);
  const retirement = totalRetirementAssets(data);
  const debt = totalDebtBalance(data);
  const dependents = dependentCount(data);

  return {
    source: "fallback",
    generatedAt: new Date().toISOString(),
    householdSummary: `${household} appears to be a ${lifeCycleStage.label.toLowerCase()} household with ${dependents} dependents, approximately $${income.toLocaleString()} of earned income, $${liquid.toLocaleString()} in reported liquid balances, $${retirement.toLocaleString()} in retirement assets, and debt balances that appear to total roughly $${debt.toLocaleString()}.`,
    lifeCycleStage,
    priorities: buildPriorities(data),
    tradeoffs: buildTradeoffs(data),
    strengths: buildStrengths(data),
    risks: buildRisks(data),
    planningDirections: buildDirections(),
    recommendationThemes: buildThemes(data),
    missingInformation: buildMissingInfo(data),
    advisorQuestions: [
      "Which household goals are truly non-negotiable versus flexible if cash flow tightens?",
      "What existing policies, account statements, and loan documents should be reviewed first to validate the intake?",
      "How do the clients want to sequence protection, debt reduction, retirement, and dependent-related goals?",
      "Which current advisors should be part of implementation if recommendations move forward?",
    ],
    clientSummary: "This intake supports a real planning conversation, but the best next step is not a product pitch. It is a structured review of protection gaps, debt pressure, estate basics, and the order in which the household wants to pursue competing goals.",
    disclaimer: "Preliminary planning analysis only. This tool does not provide final legal, tax, investment, or insurance advice.",
  };
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

function stringifyValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") return JSON.stringify(value);
  return "";
}

function normalizeLifeCycleStage(value: unknown, fallback: ReturnType<typeof inferLifeStage>) {
  if (typeof value === "string") {
    return { label: value, reasoning: "Generated by the AI analysis." };
  }

  if (value && typeof value === "object") {
    const stage = value as { label?: unknown; reasoning?: unknown };
    return {
      label: typeof stage.label === "string" ? stage.label : fallback.label,
      reasoning: typeof stage.reasoning === "string" ? stage.reasoning : fallback.reasoning,
    };
  }

  return fallback;
}

function normalizePriorities(value: unknown, fallback: GoalPriority[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (typeof item === "string") return { goal: item, priority: "medium" as const, reason: "Generated by the AI analysis." };
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const rawPriority = String(source.priority ?? source.urgency ?? "medium").toLowerCase();
      const priority = rawPriority.includes("high") ? "high" : rawPriority.includes("low") ? "low" : "medium";
      const goal = stringifyValue(source.goal || source.name || source.title);
      const reason = stringifyValue(source.reason || source.rationale || source.notes);
      if (!goal) return null;
      return { goal, priority, reason: reason || "Generated by the AI analysis." };
    })
    .filter((item): item is GoalPriority => Boolean(item));
  return normalized.length ? normalized : fallback;
}

function normalizeTradeoffs(value: unknown, fallback: Tradeoff[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (typeof item === "string") return { goal1: "Competing priorities", goal2: "Shared resources", detail: item };
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const goal1 = stringifyValue(source.goal1 || source.goal_1 || source.firstGoal) || "Goal 1";
      const goal2 = stringifyValue(source.goal2 || source.goal_2 || source.secondGoal) || "Goal 2";
      const detail = stringifyValue(source.detail || source.tradeoff || source.notes || source.reason);
      if (!detail) return null;
      return { goal1, goal2, detail };
    })
    .filter((item): item is Tradeoff => Boolean(item));
  return normalized.length ? normalized : fallback;
}

function normalizePlanningDirections(value: unknown, fallback: PlanningDirection[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          name: `Planning direction ${index + 1}`,
          summary: item,
          advantages: ["Requires advisor review."],
          drawbacks: ["Trade-offs should be validated with the client."],
        };
      }
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const name = stringifyValue(source.name || source.option_name || source.title) || `Planning direction ${index + 1}`;
      const summary = stringifyValue(source.summary || source.description || source.notes);
      const advantages = (Array.isArray(source.advantages) ? source.advantages : Array.isArray(source.potential_advantages) ? source.potential_advantages : [])
        .map((entry) => stringifyValue(entry))
        .filter(Boolean);
      const drawbacks = (Array.isArray(source.drawbacks) ? source.drawbacks : Array.isArray(source.potential_drawbacks) ? source.potential_drawbacks : [])
        .map((entry) => stringifyValue(entry))
        .filter(Boolean);
      if (!summary) return null;
      return {
        name,
        summary,
        advantages: advantages.length ? advantages : ["Requires advisor review."],
        drawbacks: drawbacks.length ? drawbacks : ["Trade-offs should be validated with the client."],
      };
    })
    .filter((item): item is PlanningDirection => Boolean(item));
  return normalized.length ? normalized : fallback;
}

function normalizeRecommendationThemes(value: unknown, fallback: RecommendationTheme[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (typeof item === "string") return { theme: item, urgency: "medium" as const, whyItMatters: "Highlighted by the AI analysis." };
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const rawUrgency = String(source.urgency ?? source.priority ?? "medium").toLowerCase();
      const urgency = rawUrgency.includes("high") ? "high" : rawUrgency.includes("low") ? "low" : "medium";
      const theme = stringifyValue(source.theme || source.title || source.name);
      const whyItMatters = stringifyValue(source.whyItMatters || source.why_it_matters || source.reason || source.notes);
      if (!theme) return null;
      return { theme, urgency, whyItMatters: whyItMatters || "Highlighted by the AI analysis." };
    })
    .filter((item): item is RecommendationTheme => Boolean(item));
  return normalized.length ? normalized : fallback;
}

function normalizeMissingInformation(value: unknown, fallback: MissingInfo[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item) => {
      if (typeof item === "string") return { item, whyNeeded: "Needed before stronger recommendations can be made." };
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const field = stringifyValue(source.item || source.name || source.field);
      const whyNeeded = stringifyValue(source.whyNeeded || source.why_needed || source.reason || source.notes);
      if (!field) return null;
      return { item: field, whyNeeded: whyNeeded || "Needed before stronger recommendations can be made." };
    })
    .filter((item): item is MissingInfo => Boolean(item));
  return normalized.length ? normalized : fallback;
}

export async function generateAnalysis(data: QuestionnaireData): Promise<AnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackAnalysis(data);
  }

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this complete financial planning questionnaire. Use all fields provided across both clients, dependents, assets, insurance, liabilities, estate issues, advisors, documents, and the stated advice request. Return only JSON with the required keys.\n\nQuestionnaire:\n${JSON.stringify(data, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    const parsed = JSON.parse(extractJson(content || "{}"));
    const fallback = buildFallbackAnalysis(data);

    return {
      source: "openai",
      generatedAt: new Date().toISOString(),
      householdSummary: stringifyValue(parsed.householdSummary) || fallback.householdSummary,
      lifeCycleStage: normalizeLifeCycleStage(parsed.lifeCycleStage, fallback.lifeCycleStage),
      priorities: normalizePriorities(parsed.priorities, fallback.priorities),
      tradeoffs: normalizeTradeoffs(parsed.tradeoffs, fallback.tradeoffs),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map((item: unknown) => stringifyValue(item)).filter(Boolean) : fallback.strengths,
      risks: Array.isArray(parsed.risks) ? parsed.risks.map((item: unknown) => stringifyValue(item)).filter(Boolean) : fallback.risks,
      planningDirections: normalizePlanningDirections(parsed.planningDirections, fallback.planningDirections),
      recommendationThemes: normalizeRecommendationThemes(parsed.recommendationThemes, fallback.recommendationThemes),
      missingInformation: normalizeMissingInformation(parsed.missingInformation, fallback.missingInformation),
      advisorQuestions: Array.isArray(parsed.advisorQuestions) ? parsed.advisorQuestions.map((item: unknown) => stringifyValue(item)).filter(Boolean) : fallback.advisorQuestions,
      clientSummary: stringifyValue(parsed.clientSummary) || fallback.clientSummary,
      disclaimer: stringifyValue(parsed.disclaimer) || fallback.disclaimer,
    };
  } catch {
    return buildFallbackAnalysis(data);
  }
}
