import {
  type AnalysisResult,
  type GoalPriority,
  type MissingInfo,
  type PlanningDirection,
  type QuestionnaireData,
  type RecommendationTheme,
  type Tradeoff,
  primaryGoalOptions,
  systemPrompt,
} from "@/lib/questionnaire";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function toNumber(value: string) {
  const normalized = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : 0;
}

function inferLifeStage(data: QuestionnaireData) {
  if (data.lifeStage) {
    return {
      label: data.lifeStage,
      reasoning: "Based on the client-provided life stage.",
    };
  }

  const dependents = toNumber(data.dependentsCount);
  if (dependents > 0) {
    return {
      label: "Family-building",
      reasoning: "Inferred from the presence of dependents.",
    };
  }

  const retirementAssets = toNumber(data.retirementAssets);
  if (retirementAssets > 300000) {
    return {
      label: "Peak earning / pre-retirement",
      reasoning: "Inferred from retirement assets and planning context.",
    };
  }

  return {
    label: "Accumulation stage",
    reasoning: "Defaulted because the questionnaire does not identify a clearer life stage.",
  };
}

function buildPriorities(data: QuestionnaireData): GoalPriority[] {
  const income = toNumber(data.annualIncome);
  const expenses = toNumber(data.annualExpenses);
  const emergencyMonths = toNumber(data.emergencyFundMonths);
  const debt = toNumber(data.totalDebt);

  const priorities = new Map<string, GoalPriority>();

  for (const goal of data.primaryGoals) {
    priorities.set(goal, {
      goal,
      priority: "medium",
      reason: "Selected directly by the household.",
    });
  }

  if (emergencyMonths > 0 && emergencyMonths < 6) {
    priorities.set("Build emergency reserves", {
      goal: "Build emergency reserves",
      priority: "high",
      reason: "Reported emergency reserves appear below a typical 6-month safety buffer.",
    });
  }

  if (debt > 0 && income > 0 && debt / income > 1.5) {
    priorities.set("Reduce debt", {
      goal: "Reduce debt",
      priority: "high",
      reason: "Debt appears large relative to household income.",
    });
  }

  if (expenses > income * 0.8 && income > 0) {
    priorities.set("Cash flow discipline", {
      goal: "Cash flow discipline",
      priority: "high",
      reason: "Spending appears to consume a large share of annual income.",
    });
  }

  return Array.from(priorities.values()).sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  });
}

function buildTradeoffs(data: QuestionnaireData): Tradeoff[] {
  const tradeoffs: Tradeoff[] = [];
  const hasRetirement = data.primaryGoals.includes("Retire comfortably");
  const hasEducation = data.primaryGoals.includes("Fund children's education");
  const hasHome = data.primaryGoals.includes("Buy a home");
  const hasProtection = data.primaryGoals.includes("Protect family income") || data.primaryGoals.includes("Optimize insurance coverage");

  if (hasRetirement && hasEducation) {
    tradeoffs.push({
      goal1: "Retire comfortably",
      goal2: "Fund children's education",
      detail: "These goals often compete for the same monthly surplus, so contribution pacing and priority order should be discussed.",
    });
  }

  if (hasHome && hasRetirement) {
    tradeoffs.push({
      goal1: "Buy a home",
      goal2: "Retire comfortably",
      detail: "A larger down payment may reduce retirement contributions in the near term unless cash flow expands.",
    });
  }

  if (hasProtection && (hasEducation || hasRetirement)) {
    tradeoffs.push({
      goal1: "Protection planning",
      goal2: "Long-term accumulation goals",
      detail: "Insurance and protection costs may need to be balanced against retirement and education saving targets.",
    });
  }

  return tradeoffs;
}

function buildStrengths(data: QuestionnaireData): string[] {
  const strengths: string[] = [];
  const income = toNumber(data.annualIncome);
  const liquidAssets = toNumber(data.liquidAssets);
  const retirementAssets = toNumber(data.retirementAssets);

  if (income >= 150000) strengths.push("Household income suggests planning flexibility if priorities are staged carefully.");
  if (liquidAssets >= 50000) strengths.push("Liquid assets provide an initial cushion for near-term planning decisions.");
  if (retirementAssets >= 100000) strengths.push("The household has already accumulated a meaningful retirement base.");
  if (data.planningScope.length >= 3) strengths.push("The household appears ready for a broad planning engagement rather than a narrow product discussion.");

  return strengths.length ? strengths : ["The questionnaire provides enough detail to begin a structured discovery conversation."];
}

function buildRisks(data: QuestionnaireData): string[] {
  const risks: string[] = [];
  const emergencyMonths = toNumber(data.emergencyFundMonths);
  const debt = toNumber(data.totalDebt);
  const income = toNumber(data.annualIncome);

  if (!emergencyMonths || emergencyMonths < 3) {
    risks.push("Emergency reserves may be thin relative to potential income disruption or unexpected expenses.");
  }
  if (data.insuranceDisability === "No coverage" || data.insuranceDisability === "Not sure") {
    risks.push("Disability protection should be reviewed because lost income can derail multiple goals at once.");
  }
  if (data.insuranceLife === "No coverage" || data.insuranceLife === "Not sure") {
    risks.push("Life insurance adequacy is unclear, which matters if others depend on this household's income.");
  }
  if (!data.hasWill || !data.hasMedicalPOA || !data.hasGeneralPOA) {
    risks.push("Estate basics appear incomplete, which can create avoidable legal and family friction.");
  }
  if (debt > 0 && income > 0 && debt / income > 2) {
    risks.push("Debt load may reduce flexibility and increase vulnerability if cash flow tightens.");
  }

  return risks.length ? risks : ["No immediate red flags stand out from the limited questionnaire data."];
}

function buildDirections(): PlanningDirection[] {
  return [
    {
      name: "Foundation-first planning",
      summary: "Stabilize liquidity, core protection, and estate basics before stretching into additional long-term goals.",
      advantages: [
        "Reduces fragility if income or expenses change suddenly.",
        "Creates a cleaner baseline for future investment and education planning.",
      ],
      drawbacks: [
        "May slow progress on aspirational goals in the near term.",
      ],
    },
    {
      name: "Parallel progress planning",
      summary: "Advance retirement, protection, and family goals simultaneously using staged contribution targets.",
      advantages: [
        "Maintains momentum across several goals at once.",
        "Can fit households with strong income and disciplined cash flow.",
      ],
      drawbacks: [
        "Requires clearer trade-off decisions and tighter monitoring.",
      ],
    },
  ];
}

function buildThemes(data: QuestionnaireData): RecommendationTheme[] {
  const themes: RecommendationTheme[] = [
    {
      theme: "Clarify and sequence household goals",
      urgency: "high",
      whyItMatters: "The questionnaire suggests multiple simultaneous goals that likely compete for the same resources.",
    },
    {
      theme: "Review core protection coverage",
      urgency: data.insuranceLife === "Adequate coverage" && data.insuranceDisability === "Adequate coverage" ? "medium" : "high",
      whyItMatters: "Insurance gaps can undermine every other part of the plan if a major event occurs.",
    },
    {
      theme: "Build an implementation dashboard",
      urgency: "medium",
      whyItMatters: "A staged plan with milestones makes it easier to monitor trade-offs and adjust over time.",
    },
  ];

  if (!data.hasWill || !data.hasMedicalPOA || !data.hasGeneralPOA) {
    themes.push({
      theme: "Address estate documents",
      urgency: "high",
      whyItMatters: "Basic legal documents often become urgent once a household has dependents, assets, or shared obligations.",
    });
  }

  return themes;
}

function buildMissingInfo(data: QuestionnaireData): MissingInfo[] {
  const missing: MissingInfo[] = [];
  const add = (condition: boolean, item: string, whyNeeded: string) => {
    if (condition) missing.push({ item, whyNeeded });
  };

  add(!data.adviceSought, "Primary advice sought", "The advisor needs a direct statement of what prompted the household to seek help now.");
  add(!data.lifeStage, "Life stage", "Explicit life-stage context helps frame typical priorities and trade-offs.");
  add(!data.annualIncome, "Annual income", "Cash flow capacity affects nearly every recommendation.");
  add(!data.annualExpenses, "Annual expenses", "Spending data is needed to evaluate surplus, savings rate, and liquidity needs.");
  add(!data.totalDebt, "Debt details", "Debt type and cost influence whether liquidity, refinancing, or faster payoff should come first.");
  add(!data.notes, "Additional context", "Open-text context often reveals constraints and values not captured in checkbox fields.");

  return missing;
}

export function buildFallbackAnalysis(data: QuestionnaireData): AnalysisResult {
  const lifeCycleStage = inferLifeStage(data);
  const priorities = buildPriorities(data);
  const risks = buildRisks(data);
  const strengths = buildStrengths(data);
  const missingInformation = buildMissingInfo(data);

  const summaryBits = [
    data.householdName || "This household",
    data.cityState ? `in ${data.cityState}` : "",
    data.maritalStatus ? `${data.maritalStatus.toLowerCase()} household` : "household",
    toNumber(data.dependentsCount) > 0 ? `with ${data.dependentsCount} dependents` : "",
  ].filter(Boolean);

  return {
    source: "fallback",
    generatedAt: new Date().toISOString(),
    householdSummary: `${summaryBits.join(" ")} is seeking help with ${data.planningScope.join(", ").toLowerCase() || "financial planning basics"}.`,
    lifeCycleStage,
    priorities,
    tradeoffs: buildTradeoffs(data),
    strengths,
    risks,
    planningDirections: buildDirections(),
    recommendationThemes: buildThemes(data),
    missingInformation,
    advisorQuestions: [
      "Which goal would the household protect first if monthly surplus were tighter than expected?",
      "How much risk to lifestyle would a 6–12 month income interruption create?",
      "What existing employer benefits or outside policies are already in force?",
      "Which goals are emotionally non-negotiable versus financially flexible?",
    ],
    clientSummary: "This preliminary analysis suggests the most value will come from clarifying goal order, pressure-testing protection gaps, and translating broad goals into a staged implementation plan.",
    disclaimer: "Preliminary planning analysis only. This tool does not provide final legal, tax, investment, or insurance advice.",
  };
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
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
            content: `Analyze the following questionnaire data and return JSON with the keys: householdSummary, lifeCycleStage, priorities, tradeoffs, strengths, risks, planningDirections, recommendationThemes, missingInformation, advisorQuestions, clientSummary, disclaimer.\n\nQuestionnaire data:\n${JSON.stringify(data, null, 2)}`,
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

    return {
      source: "openai",
      generatedAt: new Date().toISOString(),
      householdSummary: parsed.householdSummary || buildFallbackAnalysis(data).householdSummary,
      lifeCycleStage: parsed.lifeCycleStage || inferLifeStage(data),
      priorities: Array.isArray(parsed.priorities) ? parsed.priorities : buildPriorities(data),
      tradeoffs: Array.isArray(parsed.tradeoffs) ? parsed.tradeoffs : buildTradeoffs(data),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : buildStrengths(data),
      risks: Array.isArray(parsed.risks) ? parsed.risks : buildRisks(data),
      planningDirections: Array.isArray(parsed.planningDirections) ? parsed.planningDirections : buildDirections(),
      recommendationThemes: Array.isArray(parsed.recommendationThemes) ? parsed.recommendationThemes : buildThemes(data),
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : buildMissingInfo(data),
      advisorQuestions: Array.isArray(parsed.advisorQuestions) ? parsed.advisorQuestions : [],
      clientSummary: parsed.clientSummary || "AI-generated preliminary planning summary.",
      disclaimer: parsed.disclaimer || "Preliminary planning analysis only. This tool does not provide final legal, tax, investment, or insurance advice.",
    };
  } catch {
    return buildFallbackAnalysis(data);
  }
}

export function availableGoals() {
  return [...primaryGoalOptions];
}
