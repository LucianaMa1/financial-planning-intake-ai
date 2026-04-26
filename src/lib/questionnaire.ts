export type Priority = "high" | "medium" | "low";

export type QuestionnaireData = {
  householdName: string;
  contactEmail: string;
  cityState: string;
  lifeStage: string;
  maritalStatus: string;
  dependentsCount: string;
  planningScope: string[];
  primaryGoals: string[];
  adviceSought: string;
  annualIncome: string;
  liquidAssets: string;
  retirementAssets: string;
  homeEquity: string;
  annualExpenses: string;
  totalDebt: string;
  emergencyFundMonths: string;
  insuranceHealth: string;
  insuranceLife: string;
  insuranceDisability: string;
  insuranceUmbrella: string;
  insuranceLongTermCare: string;
  hasWill: boolean;
  hasLivingWill: boolean;
  hasMedicalPOA: boolean;
  hasGeneralPOA: boolean;
  notes: string;
};

export type GoalPriority = {
  goal: string;
  priority: Priority;
  reason: string;
};

export type Tradeoff = {
  goal1: string;
  goal2: string;
  detail: string;
};

export type PlanningDirection = {
  name: string;
  summary: string;
  advantages: string[];
  drawbacks: string[];
};

export type RecommendationTheme = {
  theme: string;
  urgency: Priority;
  whyItMatters: string;
};

export type MissingInfo = {
  item: string;
  whyNeeded: string;
};

export type AnalysisResult = {
  source: "openai" | "fallback";
  generatedAt: string;
  householdSummary: string;
  lifeCycleStage: {
    label: string;
    reasoning: string;
  };
  priorities: GoalPriority[];
  tradeoffs: Tradeoff[];
  strengths: string[];
  risks: string[];
  planningDirections: PlanningDirection[];
  recommendationThemes: RecommendationTheme[];
  missingInformation: MissingInfo[];
  advisorQuestions: string[];
  clientSummary: string;
  disclaimer: string;
};

export const planningScopeOptions = [
  "Cash flow planning",
  "Retirement planning",
  "Insurance review",
  "Education funding",
  "Debt reduction",
  "Estate basics",
  "Tax-aware planning",
] as const;

export const primaryGoalOptions = [
  "Build emergency reserves",
  "Reduce debt",
  "Buy a home",
  "Fund children's education",
  "Retire comfortably",
  "Protect family income",
  "Optimize insurance coverage",
  "Create/update estate documents",
  "Increase investable assets",
] as const;

export const insuranceStatusOptions = [
  "Not sure",
  "No coverage",
  "Some coverage",
  "Adequate coverage",
] as const;

export const initialQuestionnaire: QuestionnaireData = {
  householdName: "",
  contactEmail: "",
  cityState: "",
  lifeStage: "",
  maritalStatus: "",
  dependentsCount: "0",
  planningScope: ["Retirement planning", "Insurance review"],
  primaryGoals: ["Retire comfortably", "Protect family income"],
  adviceSought: "",
  annualIncome: "",
  liquidAssets: "",
  retirementAssets: "",
  homeEquity: "",
  annualExpenses: "",
  totalDebt: "",
  emergencyFundMonths: "",
  insuranceHealth: "Some coverage",
  insuranceLife: "Not sure",
  insuranceDisability: "Not sure",
  insuranceUmbrella: "No coverage",
  insuranceLongTermCare: "Not sure",
  hasWill: false,
  hasLivingWill: false,
  hasMedicalPOA: false,
  hasGeneralPOA: false,
  notes: "",
};

export const demoQuestionnaire: QuestionnaireData = {
  householdName: "Chen Family",
  contactEmail: "demo@example.com",
  cityState: "San Francisco, CA",
  lifeStage: "Family-building",
  maritalStatus: "Married",
  dependentsCount: "2",
  planningScope: ["Retirement planning", "Insurance review", "Education funding", "Estate basics"],
  primaryGoals: ["Retire comfortably", "Fund children's education", "Protect family income", "Create/update estate documents"],
  adviceSought: "We want to balance retirement, college funding, and insurance decisions without overcommitting cash flow.",
  annualIncome: "285000",
  liquidAssets: "70000",
  retirementAssets: "190000",
  homeEquity: "160000",
  annualExpenses: "210000",
  totalDebt: "540000",
  emergencyFundMonths: "3",
  insuranceHealth: "Adequate coverage",
  insuranceLife: "Some coverage",
  insuranceDisability: "No coverage",
  insuranceUmbrella: "No coverage",
  insuranceLongTermCare: "No coverage",
  hasWill: false,
  hasLivingWill: false,
  hasMedicalPOA: false,
  hasGeneralPOA: false,
  notes: "One spouse works in tech, the other recently became self-employed. Unsure whether current term life coverage is sufficient.",
};

export const systemPrompt = `You are an AI financial planning intake analyst supporting a CFP-style planning workflow.

Your role is NOT to provide final legal, tax, insurance, investment, or actuarial advice.
Your role is to analyze a client's questionnaire submission and produce a structured preliminary planning analysis for advisor review.

Core planning principles:
1. Most clients have multiple financial and life goals at any given time.
2. Resources are finite, so competing goals often require prioritization and compromise.
3. Goals are dynamic and may change across the client’s life cycle.
4. Life stage provides a guideline, but each client has unique values and priorities.
5. Sound planning requires analyzing the client’s current course of action and considering reasonable alternatives.
6. Preliminary recommendation themes must be grounded in the client’s goals, scope, information gathered, and reasonable alternatives.
7. Financial planning is iterative; incomplete data should lead to follow-up questions, not false certainty.

Instructions:
- Identify explicit and implicit goals.
- Prioritize goals based on urgency, dependency, time horizon, risk exposure, and stated importance.
- Highlight trade-offs when multiple goals compete for limited resources.
- Infer likely life-cycle stage only when supported by the data.
- Clearly separate facts from assumptions or inferences.
- Analyze the client’s current financial direction, including strengths, weaknesses, constraints, and risks.
- Identify reasonable alternative planning directions where appropriate.
- Frame outputs as preliminary planning observations and discussion points, not final instructions.
- Do not fabricate missing facts.
- Do not overstate certainty.
- Do not promise outcomes.
- Do not jump prematurely into product-specific recommendations unless clearly supported by the intake data.

Output valid JSON only.`;

export const emptyAnalysis: AnalysisResult = {
  source: "fallback",
  generatedAt: new Date(0).toISOString(),
  householdSummary: "",
  lifeCycleStage: { label: "", reasoning: "" },
  priorities: [],
  tradeoffs: [],
  strengths: [],
  risks: [],
  planningDirections: [],
  recommendationThemes: [],
  missingInformation: [],
  advisorQuestions: [],
  clientSummary: "",
  disclaimer: "",
};
