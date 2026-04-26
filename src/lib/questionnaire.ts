export type Priority = "high" | "medium" | "low";

export type ClientKey = "client1" | "client2";

export type ClientProfile = {
  fullName: string;
  homeAddress: string;
  cityStateZip: string;
  homePhone: string;
  workPhone: string;
  mobilePhone: string;
  occupation: string;
  employer: string;
  annualEarnedIncome: string;
  fax: string;
  email: string;
  birthDate: string;
  priorMarriages: string;
};

export type DependentInfo = {
  name: string;
  relationship: string;
  dateOfBirth: string;
  dependent: string;
  resides: string;
};

export type BankAccount = {
  owner: ClientKey | "";
  institution: string;
  accountNumberType: string;
  averageBalance: string;
};

export type CertificateOfDeposit = {
  owner: ClientKey | "";
  heldAt: string;
  maturity: string;
  value: string;
};

export type ResidenceAsset = {
  owner: ClientKey | "";
  description: string;
  value: string;
};

export type AutomobileAsset = {
  owner: ClientKey | "";
  description: string;
  value: string;
};

export type RetirementAccount = {
  owner: ClientKey | "";
  typeOwnership: string;
  heldBy: string;
  accountNumber: string;
  value: string;
};

export type OtherAccount = {
  owner: ClientKey | "";
  accountNumberType: string;
  value: string;
};

export type InsuranceProfile = {
  owner: ClientKey | "";
  healthCompany: string;
  healthCoverageCost: string;
  disabilityCompany: string;
  disabilityCoverageCost: string;
  lifeCompany: string;
  lifeTypeCoverageCost: string;
  homeownersTypeCoverageCost: string;
  autoTypeCoverageCost: string;
  umbrellaLiabilityTypeCoverageCost: string;
  professionalLiabilityTypeCoverageCost: string;
  longTermCareTypeCoverageCost: string;
};

export type LiabilityProfile = {
  owner: ClientKey | "";
  creditCardMonthlyPaymentBalance: string;
  residenceLoanMonthlyPaymentBalance: string;
  autoLoanMonthlyPaymentBalance: string;
  otherDebtMonthlyPaymentBalance: string;
};

export type EstateProfile = {
  owner: ClientKey | "";
  currentWill: boolean;
  livingWill: boolean;
  medicalPowerOfAttorney: boolean;
  generalPowerOfAttorney: boolean;
};

export type CurrentAdvisors = {
  attorney: string;
  accountant: string;
  insuranceAgent: string;
  stockbroker: string;
};

export type SupportingDocuments = {
  priorYearTaxReturns: boolean;
  brokerageAccountStatements: boolean;
  trustAccountStatements: boolean;
  retirementPlanAccountStatements: boolean;
  loanDocuments: boolean;
  insurancePolicies: boolean;
  legalDocuments: boolean;
};

export type QuestionnaireData = {
  clients: {
    client1: ClientProfile;
    client2: ClientProfile;
  };
  dependents: DependentInfo[];
  assets: {
    bankAccounts: BankAccount[];
    certificatesOfDeposit: CertificateOfDeposit[];
    primaryResidence: ResidenceAsset;
    secondaryResidence: ResidenceAsset;
    automobile1: AutomobileAsset;
    automobile2: AutomobileAsset;
    retirementAccounts: RetirementAccount[];
    otherAccounts: OtherAccount[];
  };
  insurance: {
    client1: InsuranceProfile;
    client2: InsuranceProfile;
  };
  liabilities: {
    client1: LiabilityProfile;
    client2: LiabilityProfile;
  };
  estateIssues: {
    client1: EstateProfile;
    client2: EstateProfile;
  };
  supportingDocuments: SupportingDocuments;
  currentAdvisors: CurrentAdvisors;
  adviceSought: string;
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

export const ownerOptions = [
  { value: "", label: "Not specified" },
  { value: "client1", label: "Client 1" },
  { value: "client2", label: "Client 2" },
] as const;

export function hasClientProfileData(profile: ClientProfile): boolean {
  return Object.values(profile).some((value) => value.trim().length > 0);
}

export function getVisibleClientKeys(questionnaire: QuestionnaireData): ClientKey[] {
  return hasClientProfileData(questionnaire.clients.client2) ? ["client1", "client2"] : ["client1"];
}

export function createClientProfile(): ClientProfile {
  return {
    fullName: "",
    homeAddress: "",
    cityStateZip: "",
    homePhone: "",
    workPhone: "",
    mobilePhone: "",
    occupation: "",
    employer: "",
    annualEarnedIncome: "",
    fax: "",
    email: "",
    birthDate: "",
    priorMarriages: "",
  };
}

export function createDependent(): DependentInfo {
  return {
    name: "",
    relationship: "",
    dateOfBirth: "",
    dependent: "",
    resides: "",
  };
}

export function createBankAccount(): BankAccount {
  return {
    owner: "",
    institution: "",
    accountNumberType: "",
    averageBalance: "",
  };
}

export function createCertificateOfDeposit(): CertificateOfDeposit {
  return {
    owner: "",
    heldAt: "",
    maturity: "",
    value: "",
  };
}

export function createResidenceAsset(): ResidenceAsset {
  return {
    owner: "",
    description: "",
    value: "",
  };
}

export function createAutomobileAsset(): AutomobileAsset {
  return {
    owner: "",
    description: "",
    value: "",
  };
}

export function createRetirementAccount(): RetirementAccount {
  return {
    owner: "",
    typeOwnership: "",
    heldBy: "",
    accountNumber: "",
    value: "",
  };
}

export function createOtherAccount(): OtherAccount {
  return {
    owner: "",
    accountNumberType: "",
    value: "",
  };
}

export function createInsuranceProfile(): InsuranceProfile {
  return {
    owner: "",
    healthCompany: "",
    healthCoverageCost: "",
    disabilityCompany: "",
    disabilityCoverageCost: "",
    lifeCompany: "",
    lifeTypeCoverageCost: "",
    homeownersTypeCoverageCost: "",
    autoTypeCoverageCost: "",
    umbrellaLiabilityTypeCoverageCost: "",
    professionalLiabilityTypeCoverageCost: "",
    longTermCareTypeCoverageCost: "",
  };
}

export function createLiabilityProfile(): LiabilityProfile {
  return {
    owner: "",
    creditCardMonthlyPaymentBalance: "",
    residenceLoanMonthlyPaymentBalance: "",
    autoLoanMonthlyPaymentBalance: "",
    otherDebtMonthlyPaymentBalance: "",
  };
}

export function createEstateProfile(): EstateProfile {
  return {
    owner: "",
    currentWill: false,
    livingWill: false,
    medicalPowerOfAttorney: false,
    generalPowerOfAttorney: false,
  };
}

export const initialQuestionnaire: QuestionnaireData = {
  clients: {
    client1: createClientProfile(),
    client2: createClientProfile(),
  },
  dependents: [createDependent()],
  assets: {
    bankAccounts: [createBankAccount()],
    certificatesOfDeposit: [createCertificateOfDeposit()],
    primaryResidence: createResidenceAsset(),
    secondaryResidence: createResidenceAsset(),
    automobile1: createAutomobileAsset(),
    automobile2: createAutomobileAsset(),
    retirementAccounts: [createRetirementAccount()],
    otherAccounts: [createOtherAccount()],
  },
  insurance: {
    client1: createInsuranceProfile(),
    client2: createInsuranceProfile(),
  },
  liabilities: {
    client1: createLiabilityProfile(),
    client2: createLiabilityProfile(),
  },
  estateIssues: {
    client1: createEstateProfile(),
    client2: createEstateProfile(),
  },
  supportingDocuments: {
    priorYearTaxReturns: false,
    brokerageAccountStatements: false,
    trustAccountStatements: false,
    retirementPlanAccountStatements: false,
    loanDocuments: false,
    insurancePolicies: false,
    legalDocuments: false,
  },
  currentAdvisors: {
    attorney: "",
    accountant: "",
    insuranceAgent: "",
    stockbroker: "",
  },
  adviceSought: "",
};

export const demoQuestionnaire: QuestionnaireData = {
  clients: {
    client1: {
      fullName: "Wendy Chen",
      homeAddress: "1850 Hillcrest Ave",
      cityStateZip: "San Francisco, CA 94117",
      homePhone: "415-555-0181",
      workPhone: "415-555-0182",
      mobilePhone: "415-555-0183",
      occupation: "Product Lead",
      employer: "Northstar AI",
      annualEarnedIncome: "185000",
      fax: "",
      email: "wendy@example.com",
      birthDate: "1988-04-12",
      priorMarriages: "No",
    },
    client2: {
      fullName: "David Chen",
      homeAddress: "1850 Hillcrest Ave",
      cityStateZip: "San Francisco, CA 94117",
      homePhone: "415-555-0181",
      workPhone: "415-555-0282",
      mobilePhone: "415-555-0283",
      occupation: "Independent consultant",
      employer: "Self-employed",
      annualEarnedIncome: "100000",
      fax: "",
      email: "david@example.com",
      birthDate: "1987-11-03",
      priorMarriages: "No",
    },
  },
  dependents: [
    {
      name: "Emma Chen",
      relationship: "Daughter",
      dateOfBirth: "2018-06-10",
      dependent: "Yes",
      resides: "Home",
    },
    {
      name: "Lucas Chen",
      relationship: "Son",
      dateOfBirth: "2021-02-05",
      dependent: "Yes",
      resides: "Home",
    },
  ],
  assets: {
    bankAccounts: [
      {
        owner: "client1",
        institution: "First Republic",
        accountNumberType: "Checking • ****9912",
        averageBalance: "25000",
      },
      {
        owner: "client2",
        institution: "Schwab",
        accountNumberType: "Savings • ****1148",
        averageBalance: "45000",
      },
    ],
    certificatesOfDeposit: [
      {
        owner: "client1",
        heldAt: "Marcus",
        maturity: "2026-09-01",
        value: "15000",
      },
    ],
    primaryResidence: {
      owner: "client1",
      description: "Primary residence",
      value: "1600000",
    },
    secondaryResidence: {
      owner: "",
      description: "",
      value: "",
    },
    automobile1: {
      owner: "client1",
      description: "Tesla Model Y",
      value: "42000",
    },
    automobile2: {
      owner: "client2",
      description: "Subaru Outback",
      value: "23000",
    },
    retirementAccounts: [
      {
        owner: "client1",
        typeOwnership: "401(k) / Individual",
        heldBy: "Fidelity",
        accountNumber: "****3011",
        value: "140000",
      },
      {
        owner: "client2",
        typeOwnership: "SEP IRA / Individual",
        heldBy: "Vanguard",
        accountNumber: "****8892",
        value: "50000",
      },
    ],
    otherAccounts: [
      {
        owner: "client1",
        accountNumberType: "Brokerage • ****1010",
        value: "85000",
      },
    ],
  },
  insurance: {
    client1: {
      owner: "client1",
      healthCompany: "Aetna",
      healthCoverageCost: "PPO / employer plan / $450 mo",
      disabilityCompany: "",
      disabilityCoverageCost: "No separate coverage",
      lifeCompany: "Guardian",
      lifeTypeCoverageCost: "20-year term / $750k / $95 mo",
      homeownersTypeCoverageCost: "HO-3 / $1.2M dwelling / $210 mo",
      autoTypeCoverageCost: "$250k/$500k liability / $240 mo",
      umbrellaLiabilityTypeCoverageCost: "None",
      professionalLiabilityTypeCoverageCost: "None",
      longTermCareTypeCoverageCost: "None",
    },
    client2: {
      owner: "client2",
      healthCompany: "Aetna",
      healthCoverageCost: "Covered under spouse plan",
      disabilityCompany: "",
      disabilityCoverageCost: "No coverage",
      lifeCompany: "Guardian",
      lifeTypeCoverageCost: "20-year term / $500k / $70 mo",
      homeownersTypeCoverageCost: "Covered jointly",
      autoTypeCoverageCost: "Covered jointly",
      umbrellaLiabilityTypeCoverageCost: "None",
      professionalLiabilityTypeCoverageCost: "None",
      longTermCareTypeCoverageCost: "None",
    },
  },
  liabilities: {
    client1: {
      owner: "client1",
      creditCardMonthlyPaymentBalance: "$1,500 / $8,000",
      residenceLoanMonthlyPaymentBalance: "$5,900 / $520,000",
      autoLoanMonthlyPaymentBalance: "$0 / $0",
      otherDebtMonthlyPaymentBalance: "$600 / $12,000 student loan",
    },
    client2: {
      owner: "client2",
      creditCardMonthlyPaymentBalance: "$700 / $4,000",
      residenceLoanMonthlyPaymentBalance: "Shared with client 1",
      autoLoanMonthlyPaymentBalance: "$450 / $14,000",
      otherDebtMonthlyPaymentBalance: "$0 / $0",
    },
  },
  estateIssues: {
    client1: {
      owner: "client1",
      currentWill: false,
      livingWill: false,
      medicalPowerOfAttorney: false,
      generalPowerOfAttorney: false,
    },
    client2: {
      owner: "client2",
      currentWill: false,
      livingWill: false,
      medicalPowerOfAttorney: false,
      generalPowerOfAttorney: false,
    },
  },
  supportingDocuments: {
    priorYearTaxReturns: true,
    brokerageAccountStatements: true,
    trustAccountStatements: false,
    retirementPlanAccountStatements: true,
    loanDocuments: true,
    insurancePolicies: true,
    legalDocuments: false,
  },
  currentAdvisors: {
    attorney: "None currently",
    accountant: "Priya Shah, CPA",
    insuranceAgent: "Existing captive agent",
    stockbroker: "Self-directed",
  },
  adviceSought: "We need to prioritize retirement, college funding, insurance, and estate basics. We want a full financial planning analysis, not just product recommendations.",
};

export const systemPrompt = `You are an AI financial planning intake analyst supporting a CFP-style planning workflow.

You are analyzing a questionnaire modeled on a traditional comprehensive financial planning client intake form.
You must use every section of the intake that is provided:
- Client 1 general information
- Client 2 general information
- Family / dependent information
- Assets
- Insurance
- Liabilities
- Estate issues
- Current advisors
- Supporting documents available
- Comment on the advice being sought

Your role is NOT to provide final legal, tax, insurance, investment, or actuarial advice.
Your role is to produce a structured preliminary planning analysis for advisor review.

Core planning principles:
1. Most clients have multiple financial planning and life goals at the same time.
2. Resources are finite, so competing goals often require prioritization and compromise.
3. Goals change across the client life cycle.
4. Life stage is a guideline, but each client has unique values and priorities.
5. Recommendations must follow from the scope, goals, facts gathered, economic context if relevant, and available alternatives.
6. The process is iterative. If facts are missing, say so and ask for follow-up information.

Instructions:
- Explicitly identify the household's likely goals, constraints, and trade-offs.
- Use the full intake, not just income and insurance fields.
- Consider the implications of dependents, debt, estate document gaps, advisor relationships, and missing supporting documents.
- Analyze the current course of action and at least two reasonable alternative planning directions.
- Distinguish facts from assumptions.
- Do not fabricate missing facts.
- Do not jump directly into product recommendations.
- Keep the output practical for an advisor preparing a discovery or recommendation meeting.

Return valid JSON only using these keys:
- householdSummary
- lifeCycleStage
- priorities
- tradeoffs
- strengths
- risks
- planningDirections
- recommendationThemes
- missingInformation
- advisorQuestions
- clientSummary
- disclaimer`;

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
