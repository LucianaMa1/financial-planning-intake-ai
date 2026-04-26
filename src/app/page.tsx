"use client";

import { useMemo, useState } from "react";

import {
  demoQuestionnaire,
  emptyAnalysis,
  initialQuestionnaire,
  insuranceStatusOptions,
  planningScopeOptions,
  primaryGoalOptions,
  type AnalysisResult,
  type QuestionnaireData,
} from "@/lib/questionnaire";

type TextFieldProps = {
  label: string;
  name: keyof QuestionnaireData;
  value: string;
  onChange: (name: keyof QuestionnaireData, value: string) => void;
  placeholder?: string;
  type?: string;
};

function TextField({ label, name, value, onChange, placeholder, type = "text" }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

function ToggleCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        selected
          ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-200"
          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700"
      }`}
    >
      {label}
    </button>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const currencyFields: Array<{ label: string; name: keyof QuestionnaireData; helper: string }> = [
  { label: "Annual household income", name: "annualIncome", helper: "Gross annual income in USD" },
  { label: "Liquid assets", name: "liquidAssets", helper: "Cash, checking, savings, money market" },
  { label: "Retirement assets", name: "retirementAssets", helper: "401(k), IRA, pension balances" },
  { label: "Home equity", name: "homeEquity", helper: "Estimated equity across residences" },
  { label: "Annual household expenses", name: "annualExpenses", helper: "Approximate annual spending" },
  { label: "Total debt", name: "totalDebt", helper: "Mortgage, student loans, credit cards, other debt" },
];

export default function Home() {
  const [form, setForm] = useState<QuestionnaireData>(initialQuestionnaire);
  const [analysis, setAnalysis] = useState<AnalysisResult>(emptyAnalysis);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const isAnalyzed = analysis.generatedAt !== emptyAnalysis.generatedAt;

  const selectedGoalCount = useMemo(() => form.primaryGoals.length, [form.primaryGoals.length]);

  const handleChange = (name: keyof QuestionnaireData, value: string | boolean) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleArrayValue = (name: "planningScope" | "primaryGoals", value: string) => {
    setForm((current) => {
      const active = current[name];
      const next = active.includes(value)
        ? active.filter((item) => item !== value)
        : [...active, value];
      return { ...current, [name]: next };
    });
  };

  const submit = async () => {
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaire: form }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to analyze questionnaire.");
      }

      const payload = (await response.json()) as { analysis: AnalysisResult };
      setAnalysis(payload.analysis);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_38%,_#e2e8f0_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300/60">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">CFP intake MVP</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Financial planning questionnaire with instant AI pre-analysis.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Collect client facts, capture goal conflicts, and generate a CFP-style preliminary planning brief for advisor review.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/15 px-4 py-2">Goal prioritization</span>
                <span className="rounded-full border border-white/15 px-4 py-2">Risk gap detection</span>
                <span className="rounded-full border border-white/15 px-4 py-2">Advisor follow-up prompts</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setForm(demoQuestionnaire)}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
                >
                  Load demo household
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialQuestionnaire);
                    setAnalysis(emptyAnalysis);
                    setError("");
                    setStatus("idle");
                  }}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Reset form
                </button>
              </div>
            </div>
          </section>

          <Section eyebrow="Household" title="Client profile and planning context">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Household name" name="householdName" value={form.householdName} onChange={handleChange} placeholder="e.g. Chen Family" />
              <TextField label="Contact email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="family@example.com" type="email" />
              <TextField label="City / State" name="cityState" value={form.cityState} onChange={handleChange} placeholder="San Francisco, CA" />
              <TextField label="Life stage" name="lifeStage" value={form.lifeStage} onChange={handleChange} placeholder="Family-building, pre-retirement, retirement..." />
              <TextField label="Marital status" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} placeholder="Single, married, partnered..." />
              <TextField label="Dependents count" name="dependentsCount" value={form.dependentsCount} onChange={handleChange} type="number" placeholder="0" />
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              What prompted the household to seek advice now?
              <textarea
                value={form.adviceSought}
                onChange={(event) => handleChange("adviceSought", event.target.value)}
                rows={4}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="What triggered the need for planning support?"
              />
            </label>
          </Section>

          <Section eyebrow="Goals" title="Scope of engagement and priority goals">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Scope of engagement</p>
              <div className="flex flex-wrap gap-3">
                {planningScopeOptions.map((item) => (
                  <ToggleCard key={item} label={item} selected={form.planningScope.includes(item)} onClick={() => toggleArrayValue("planningScope", item)} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">Primary goals</p>
                <p className="text-xs text-slate-500">Selected: {selectedGoalCount}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {primaryGoalOptions.map((item) => (
                  <ToggleCard key={item} label={item} selected={form.primaryGoals.includes(item)} onClick={() => toggleArrayValue("primaryGoals", item)} />
                ))}
              </div>
            </div>
          </Section>

          <Section eyebrow="Financials" title="Income, assets, and liabilities snapshot">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currencyFields.map((field) => (
                <label key={field.name} className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  {field.label}
                  <input
                    type="number"
                    value={form[field.name] as string}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    placeholder="0"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                  <span className="text-xs text-slate-500">{field.helper}</span>
                </label>
              ))}
            </div>
            <TextField
              label="Emergency fund coverage (months)"
              name="emergencyFundMonths"
              value={form.emergencyFundMonths}
              onChange={handleChange}
              type="number"
              placeholder="3"
            />
          </Section>

          <Section eyebrow="Protection" title="Insurance and estate basics">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["insuranceHealth", "Health insurance"],
                ["insuranceLife", "Life insurance"],
                ["insuranceDisability", "Disability insurance"],
                ["insuranceUmbrella", "Umbrella liability"],
                ["insuranceLongTermCare", "Long-term care"],
              ].map(([name, label]) => (
                <label key={name} className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  {label}
                  <select
                    value={form[name as keyof QuestionnaireData] as string}
                    onChange={(event) => handleChange(name as keyof QuestionnaireData, event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  >
                    {insuranceStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Estate document status</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["hasWill", "Will"],
                  ["hasLivingWill", "Living will"],
                  ["hasMedicalPOA", "Medical POA"],
                  ["hasGeneralPOA", "General POA"],
                ].map(([name, label]) => {
                  const checked = form[name as keyof QuestionnaireData] as boolean;
                  return (
                    <label
                      key={name}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        checked
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => handleChange(name as keyof QuestionnaireData, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Additional household notes
              <textarea
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                rows={4}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="Anything else the advisor should know?"
              />
            </label>
          </Section>

          <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Generate advisor-ready analysis</h3>
              <p className="mt-1 text-sm text-slate-600">
                Uses OpenAI when <code>OPENAI_API_KEY</code> is set. Otherwise, the app falls back to a local rules-based analysis so the demo still works.
              </p>
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={status === "submitting"}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {status === "submitting" ? "Analyzing…" : "Analyze questionnaire"}
            </button>
          </div>
          {status === "error" ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}
        </div>

        <aside className="w-full xl:sticky xl:top-8 xl:max-w-xl">
          <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Analysis</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Preliminary planning brief</h2>
              </div>
              {isAnalyzed ? (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  {analysis.source === "openai" ? "OpenAI" : "Fallback engine"}
                </span>
              ) : null}
            </div>

            {!isAnalyzed ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-sm leading-7 text-slate-500">
                Submit the intake to generate household summary, goal prioritization, planning directions, and advisor follow-up questions.
              </div>
            ) : (
              <div className="space-y-5 text-sm text-slate-700">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Household snapshot</p>
                  <p className="mt-2 leading-7">{analysis.householdSummary}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Life stage:</span> {analysis.lifeCycleStage.label} — {analysis.lifeCycleStage.reasoning}
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-950">Priority goals</h3>
                  <div className="mt-3 space-y-3">
                    {analysis.priorities.map((item) => (
                      <div key={`${item.goal}-${item.priority}`} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900">{item.goal}</p>
                          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase text-white">{item.priority}</span>
                        </div>
                        <p className="mt-2 text-slate-600">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-950">Key trade-offs</h3>
                  <div className="mt-3 space-y-3">
                    {analysis.tradeoffs.length ? analysis.tradeoffs.map((item) => (
                      <div key={`${item.goal1}-${item.goal2}`} className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-medium text-slate-900">{item.goal1} ↔ {item.goal2}</p>
                        <p className="mt-2 text-slate-600">{item.detail}</p>
                      </div>
                    )) : <p className="rounded-2xl bg-slate-50 p-4 text-slate-600">No major trade-offs identified yet from the current intake.</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-emerald-50 p-5">
                    <h3 className="text-base font-semibold text-emerald-950">Strengths</h3>
                    <ul className="mt-3 space-y-2 text-emerald-900">
                      {analysis.strengths.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-amber-50 p-5">
                    <h3 className="text-base font-semibold text-amber-950">Risks / gaps</h3>
                    <ul className="mt-3 space-y-2 text-amber-900">
                      {analysis.risks.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-950">Planning directions</h3>
                  <div className="mt-3 space-y-3">
                    {analysis.planningDirections.map((direction) => (
                      <div key={direction.name} className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-medium text-slate-900">{direction.name}</p>
                        <p className="mt-2 text-slate-600">{direction.summary}</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Advantages</p>
                            <ul className="mt-2 space-y-1 text-slate-600">
                              {direction.advantages.map((item) => <li key={item}>• {item}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Drawbacks</p>
                            <ul className="mt-2 space-y-1 text-slate-600">
                              {direction.drawbacks.map((item) => <li key={item}>• {item}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-950">Recommendation themes</h3>
                  <div className="mt-3 space-y-3">
                    {analysis.recommendationThemes.map((item) => (
                      <div key={item.theme} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-900">{item.theme}</p>
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">{item.urgency}</span>
                        </div>
                        <p className="mt-2 text-slate-600">{item.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-950">Missing information</h3>
                  <div className="mt-3 space-y-3">
                    {analysis.missingInformation.length ? analysis.missingInformation.map((item) => (
                      <div key={item.item} className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-medium text-slate-900">{item.item}</p>
                        <p className="mt-2 text-slate-600">{item.whyNeeded}</p>
                      </div>
                    )) : <p className="rounded-2xl bg-slate-50 p-4 text-slate-600">The intake already includes the main fields needed for an initial discussion.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-950">Advisor follow-up questions</h3>
                  <ul className="mt-3 space-y-2 rounded-3xl bg-slate-50 p-5 text-slate-700">
                    {analysis.advisorQuestions.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>

                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <h3 className="text-base font-semibold">Client-friendly summary</h3>
                  <p className="mt-3 leading-7 text-slate-200">{analysis.clientSummary}</p>
                  <p className="mt-4 text-xs text-slate-400">{analysis.disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
