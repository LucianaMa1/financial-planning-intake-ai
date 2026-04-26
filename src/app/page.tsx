"use client";

import { useState } from "react";

import {
  createBankAccount,
  createCertificateOfDeposit,
  createDependent,
  createOtherAccount,
  createRetirementAccount,
  demoQuestionnaire,
  emptyAnalysis,
  initialQuestionnaire,
  ownerOptions,
  type AnalysisResult,
  type ClientKey,
  type ClientProfile,
  type QuestionnaireData,
} from "@/lib/questionnaire";

type SectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Section({ eyebrow, title, description, children }: SectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

function OwnerSelect({ value, onChange, label = "Owner" }: { value: string; onChange: (value: ClientKey | "") => void; label?: string }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ClientKey | "")}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      >
        {ownerOptions.map((option) => (
          <option key={option.value || "none"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${checked ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
      {label}
    </label>
  );
}

function ArrayCard({ title, children, onRemove }: { title: string; children: React.ReactNode; onRemove?: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        {onRemove ? (
          <button type="button" onClick={onRemove} className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
            Remove
          </button>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ClientGeneralSection({
  title,
  profile,
  onChange,
}: {
  title: string;
  profile: ClientProfile;
  onChange: <K extends keyof ClientProfile>(field: K, value: ClientProfile[K]) => void;
}) {
  return (
    <ArrayCard title={title}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Full name" value={profile.fullName} onChange={(value) => onChange("fullName", value)} />
        <Field label="Home address" value={profile.homeAddress} onChange={(value) => onChange("homeAddress", value)} />
        <Field label="City, State, Zip" value={profile.cityStateZip} onChange={(value) => onChange("cityStateZip", value)} />
        <Field label="Home phone" value={profile.homePhone} onChange={(value) => onChange("homePhone", value)} />
        <Field label="Work phone" value={profile.workPhone} onChange={(value) => onChange("workPhone", value)} />
        <Field label="Mobile phone" value={profile.mobilePhone} onChange={(value) => onChange("mobilePhone", value)} />
        <Field label="Occupation" value={profile.occupation} onChange={(value) => onChange("occupation", value)} />
        <Field label="Employer" value={profile.employer} onChange={(value) => onChange("employer", value)} />
        <Field label="Annual earned income" value={profile.annualEarnedIncome} onChange={(value) => onChange("annualEarnedIncome", value)} type="number" />
        <Field label="Fax" value={profile.fax} onChange={(value) => onChange("fax", value)} />
        <Field label="Email" value={profile.email} onChange={(value) => onChange("email", value)} type="email" />
        <Field label="Social Security # (masked)" value={profile.socialSecurityMasked} onChange={(value) => onChange("socialSecurityMasked", value)} placeholder="***-**-1234" />
        <Field label="Birth date" value={profile.birthDate} onChange={(value) => onChange("birthDate", value)} type="date" />
        <Field label="Prior marriage(s)" value={profile.priorMarriages} onChange={(value) => onChange("priorMarriages", value)} placeholder="Yes / No / Details" />
      </div>
    </ArrayCard>
  );
}

export default function Home() {
  const [form, setForm] = useState<QuestionnaireData>(initialQuestionnaire);
  const [analysis, setAnalysis] = useState<AnalysisResult>(emptyAnalysis);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const isAnalyzed = analysis.generatedAt !== emptyAnalysis.generatedAt;

  const updateClient = <K extends keyof ClientProfile>(client: ClientKey, field: K, value: ClientProfile[K]) => {
    setForm((current) => ({
      ...current,
      clients: {
        ...current.clients,
        [client]: {
          ...current.clients[client],
          [field]: value,
        },
      },
    }));
  };

  const updateArrayItem = <T,>(
    key: "dependents" | "bankAccounts" | "certificatesOfDeposit" | "retirementAccounts" | "otherAccounts",
    index: number,
    field: string,
    value: unknown,
  ) => {
    setForm((current) => {
      if (key === "dependents") {
        const next = [...current.dependents];
        next[index] = { ...next[index], [field]: value };
        return { ...current, dependents: next };
      }

      const nextAssets = { ...current.assets };
      const source = [...(nextAssets[key] as T[])];
      source[index] = { ...(source[index] as object), [field]: value } as T;
      (nextAssets[key] as T[]) = source;
      return { ...current, assets: nextAssets };
    });
  };

  const addItem = (key: "dependents" | "bankAccounts" | "certificatesOfDeposit" | "retirementAccounts" | "otherAccounts") => {
    setForm((current) => {
      if (key === "dependents") return { ...current, dependents: [...current.dependents, createDependent()] };
      if (key === "bankAccounts") return { ...current, assets: { ...current.assets, bankAccounts: [...current.assets.bankAccounts, createBankAccount()] } };
      if (key === "certificatesOfDeposit") return { ...current, assets: { ...current.assets, certificatesOfDeposit: [...current.assets.certificatesOfDeposit, createCertificateOfDeposit()] } };
      if (key === "retirementAccounts") return { ...current, assets: { ...current.assets, retirementAccounts: [...current.assets.retirementAccounts, createRetirementAccount()] } };
      return { ...current, assets: { ...current.assets, otherAccounts: [...current.assets.otherAccounts, createOtherAccount()] } };
    });
  };

  const removeItem = (key: "dependents" | "bankAccounts" | "certificatesOfDeposit" | "retirementAccounts" | "otherAccounts", index: number) => {
    setForm((current) => {
      if (key === "dependents") return { ...current, dependents: current.dependents.filter((_, itemIndex) => itemIndex !== index) || [createDependent()] };
      return {
        ...current,
        assets: {
          ...current.assets,
          [key]: (current.assets[key] as unknown[]).filter((_, itemIndex) => itemIndex !== index),
        },
      } as QuestionnaireData;
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
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Comprehensive CFP intake</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Full financial planning questionnaire with AI analysis.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                This version now mirrors the questionnaire you sent: Client 1, Client 2, dependents, assets, insurance, liabilities, estate issues, advisors, and supporting documents.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => setForm(demoQuestionnaire)} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100">
                  Load full demo case
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

          <Section eyebrow="General information" title="Client 1 and Client 2" description="These fields directly mirror the General Information section in the sample questionnaire.">
            <ClientGeneralSection title="Client 1" profile={form.clients.client1} onChange={(field, value) => updateClient("client1", field, value)} />
            <ClientGeneralSection title="Client 2" profile={form.clients.client2} onChange={(field, value) => updateClient("client2", field, value)} />
          </Section>

          <Section eyebrow="Family / dependent information" title="Dependents and family members" description="Matches the Family/Dependent Information section: Name, Relationship, Date of Birth, Social Security #, Dependent, Resides.">
            <div className="space-y-4">
              {form.dependents.map((dependent, index) => (
                <ArrayCard key={`dependent-${index}`} title={`Dependent ${index + 1}`} onRemove={form.dependents.length > 1 ? () => removeItem("dependents", index) : undefined}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Name" value={dependent.name} onChange={(value) => updateArrayItem("dependents", index, "name", value)} />
                    <Field label="Relationship" value={dependent.relationship} onChange={(value) => updateArrayItem("dependents", index, "relationship", value)} />
                    <Field label="Date of Birth" value={dependent.dateOfBirth} onChange={(value) => updateArrayItem("dependents", index, "dateOfBirth", value)} type="date" />
                    <Field label="Social Security # (masked)" value={dependent.socialSecurityMasked} onChange={(value) => updateArrayItem("dependents", index, "socialSecurityMasked", value)} placeholder="***-**-0000" />
                    <Field label="Dependent" value={dependent.dependent} onChange={(value) => updateArrayItem("dependents", index, "dependent", value)} placeholder="Yes / No" />
                    <Field label="Resides" value={dependent.resides} onChange={(value) => updateArrayItem("dependents", index, "resides", value)} placeholder="Home / College / Elsewhere" />
                  </div>
                </ArrayCard>
              ))}
              <button type="button" onClick={() => addItem("dependents")} className="rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
                Add dependent
              </button>
            </div>
          </Section>

          <Section eyebrow="Assets" title="Assets section from the questionnaire" description="Includes bank accounts, CDs, primary/secondary residence, automobiles, retirement accounts, and other accounts, with ownership captured for each line item.">
            <div className="space-y-4">
              {form.assets.bankAccounts.map((account, index) => (
                <ArrayCard key={`bank-${index}`} title={`Bank account ${index + 1}`} onRemove={form.assets.bankAccounts.length > 1 ? () => removeItem("bankAccounts", index) : undefined}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <OwnerSelect value={account.owner} onChange={(value) => updateArrayItem("bankAccounts", index, "owner", value)} />
                    <Field label="Bank account" value={account.institution} onChange={(value) => updateArrayItem("bankAccounts", index, "institution", value)} />
                    <Field label="Account number & type" value={account.accountNumberType} onChange={(value) => updateArrayItem("bankAccounts", index, "accountNumberType", value)} />
                    <Field label="Average balance" value={account.averageBalance} onChange={(value) => updateArrayItem("bankAccounts", index, "averageBalance", value)} type="number" />
                  </div>
                </ArrayCard>
              ))}
              <button type="button" onClick={() => addItem("bankAccounts")} className="rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Add bank account</button>

              {form.assets.certificatesOfDeposit.map((item, index) => (
                <ArrayCard key={`cd-${index}`} title={`CD ${index + 1}`} onRemove={form.assets.certificatesOfDeposit.length > 1 ? () => removeItem("certificatesOfDeposit", index) : undefined}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <OwnerSelect value={item.owner} onChange={(value) => updateArrayItem("certificatesOfDeposit", index, "owner", value)} />
                    <Field label="CD held at" value={item.heldAt} onChange={(value) => updateArrayItem("certificatesOfDeposit", index, "heldAt", value)} />
                    <Field label="Maturity" value={item.maturity} onChange={(value) => updateArrayItem("certificatesOfDeposit", index, "maturity", value)} />
                    <Field label="Value" value={item.value} onChange={(value) => updateArrayItem("certificatesOfDeposit", index, "value", value)} type="number" />
                  </div>
                </ArrayCard>
              ))}
              <button type="button" onClick={() => addItem("certificatesOfDeposit")} className="rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Add CD</button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ArrayCard title="Primary residence">
                <div className="grid gap-4 md:grid-cols-3">
                  <OwnerSelect value={form.assets.primaryResidence.owner} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, primaryResidence: { ...current.assets.primaryResidence, owner: value } } }))} />
                  <Field label="Primary residence" value={form.assets.primaryResidence.description} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, primaryResidence: { ...current.assets.primaryResidence, description: value } } }))} />
                  <Field label="Value" value={form.assets.primaryResidence.value} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, primaryResidence: { ...current.assets.primaryResidence, value } } }))} type="number" />
                </div>
              </ArrayCard>
              <ArrayCard title="Secondary residence">
                <div className="grid gap-4 md:grid-cols-3">
                  <OwnerSelect value={form.assets.secondaryResidence.owner} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, secondaryResidence: { ...current.assets.secondaryResidence, owner: value } } }))} />
                  <Field label="Secondary residence" value={form.assets.secondaryResidence.description} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, secondaryResidence: { ...current.assets.secondaryResidence, description: value } } }))} />
                  <Field label="Value" value={form.assets.secondaryResidence.value} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, secondaryResidence: { ...current.assets.secondaryResidence, value } } }))} type="number" />
                </div>
              </ArrayCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ArrayCard title="Automobile 1">
                <div className="grid gap-4 md:grid-cols-3">
                  <OwnerSelect value={form.assets.automobile1.owner} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, automobile1: { ...current.assets.automobile1, owner: value } } }))} />
                  <Field label="Automobile 1" value={form.assets.automobile1.description} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, automobile1: { ...current.assets.automobile1, description: value } } }))} />
                  <Field label="Value" value={form.assets.automobile1.value} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, automobile1: { ...current.assets.automobile1, value } } }))} type="number" />
                </div>
              </ArrayCard>
              <ArrayCard title="Automobile 2">
                <div className="grid gap-4 md:grid-cols-3">
                  <OwnerSelect value={form.assets.automobile2.owner} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, automobile2: { ...current.assets.automobile2, owner: value } } }))} />
                  <Field label="Automobile 2" value={form.assets.automobile2.description} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, automobile2: { ...current.assets.automobile2, description: value } } }))} />
                  <Field label="Value" value={form.assets.automobile2.value} onChange={(value) => setForm((current) => ({ ...current, assets: { ...current.assets, automobile2: { ...current.assets.automobile2, value } } }))} type="number" />
                </div>
              </ArrayCard>
            </div>

            <div className="space-y-4">
              {form.assets.retirementAccounts.map((account, index) => (
                <ArrayCard key={`ret-${index}`} title={`Retirement account ${index + 1}`} onRemove={form.assets.retirementAccounts.length > 1 ? () => removeItem("retirementAccounts", index) : undefined}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <OwnerSelect value={account.owner} onChange={(value) => updateArrayItem("retirementAccounts", index, "owner", value)} />
                    <Field label="Type / ownership" value={account.typeOwnership} onChange={(value) => updateArrayItem("retirementAccounts", index, "typeOwnership", value)} />
                    <Field label="Held by" value={account.heldBy} onChange={(value) => updateArrayItem("retirementAccounts", index, "heldBy", value)} />
                    <Field label="Account number" value={account.accountNumber} onChange={(value) => updateArrayItem("retirementAccounts", index, "accountNumber", value)} />
                    <Field label="Value" value={account.value} onChange={(value) => updateArrayItem("retirementAccounts", index, "value", value)} type="number" />
                  </div>
                </ArrayCard>
              ))}
              <button type="button" onClick={() => addItem("retirementAccounts")} className="rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Add retirement account</button>
            </div>

            <div className="space-y-4">
              {form.assets.otherAccounts.map((account, index) => (
                <ArrayCard key={`other-${index}`} title={`Other account ${index + 1}`} onRemove={form.assets.otherAccounts.length > 1 ? () => removeItem("otherAccounts", index) : undefined}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <OwnerSelect value={account.owner} onChange={(value) => updateArrayItem("otherAccounts", index, "owner", value)} />
                    <Field label="Account number & type" value={account.accountNumberType} onChange={(value) => updateArrayItem("otherAccounts", index, "accountNumberType", value)} />
                    <Field label="Value" value={account.value} onChange={(value) => updateArrayItem("otherAccounts", index, "value", value)} type="number" />
                  </div>
                </ArrayCard>
              ))}
              <button type="button" onClick={() => addItem("otherAccounts")} className="rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">Add other account</button>
            </div>
          </Section>

          <Section eyebrow="Insurance" title="Insurance profiles" description="Matches the second questionnaire page: Health, Disability, Life, Homeowners, Auto, Umbrella Liability, Professional Liability, and Long Term Care.">
            {(["client1", "client2"] as ClientKey[]).map((clientKey) => {
              const profile = form.insurance[clientKey];
              const title = clientKey === "client1" ? "Insurance – Client 1" : "Insurance – Client 2";
              return (
                <ArrayCard key={clientKey} title={title}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <OwnerSelect value={profile.owner} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], owner: value } } }))} label="Ownership: Client 1 or 2" />
                    <Field label="Health / Company" value={profile.healthCompany} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], healthCompany: value } } }))} />
                    <Field label="Coverage / Cost" value={profile.healthCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], healthCoverageCost: value } } }))} />
                    <Field label="Disability / Company" value={profile.disabilityCompany} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], disabilityCompany: value } } }))} />
                    <Field label="Coverage / Cost" value={profile.disabilityCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], disabilityCoverageCost: value } } }))} />
                    <Field label="Life / Company" value={profile.lifeCompany} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], lifeCompany: value } } }))} />
                    <Field label="Type / Coverage / Cost" value={profile.lifeTypeCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], lifeTypeCoverageCost: value } } }))} />
                    <Field label="Homeowners – Type / Coverage / Cost" value={profile.homeownersTypeCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], homeownersTypeCoverageCost: value } } }))} />
                    <Field label="Auto – Type / Coverage / Cost" value={profile.autoTypeCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], autoTypeCoverageCost: value } } }))} />
                    <Field label="Umbrella Liability – Type / Coverage / Cost" value={profile.umbrellaLiabilityTypeCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], umbrellaLiabilityTypeCoverageCost: value } } }))} />
                    <Field label="Professional Liability – Type / Coverage / Cost" value={profile.professionalLiabilityTypeCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], professionalLiabilityTypeCoverageCost: value } } }))} />
                    <Field label="Long Term Care – Type / Coverage / Cost" value={profile.longTermCareTypeCoverageCost} onChange={(value) => setForm((current) => ({ ...current, insurance: { ...current.insurance, [clientKey]: { ...current.insurance[clientKey], longTermCareTypeCoverageCost: value } } }))} />
                  </div>
                </ArrayCard>
              );
            })}
          </Section>

          <Section eyebrow="Liabilities and estate" title="Liabilities and estate issues" description="Matches the Liabilities and Estate Issues sections on page 2.">
            <div className="grid gap-4 xl:grid-cols-2">
              {(["client1", "client2"] as ClientKey[]).map((clientKey) => (
                <ArrayCard key={`liability-${clientKey}`} title={`Liabilities – ${clientKey === "client1" ? "Client 1" : "Client 2"}`}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <OwnerSelect value={form.liabilities[clientKey].owner} onChange={(value) => setForm((current) => ({ ...current, liabilities: { ...current.liabilities, [clientKey]: { ...current.liabilities[clientKey], owner: value } } }))} label="Client 1 or 2" />
                    <Field label="Credit Card – Monthly Pmt. / Balance" value={form.liabilities[clientKey].creditCardMonthlyPaymentBalance} onChange={(value) => setForm((current) => ({ ...current, liabilities: { ...current.liabilities, [clientKey]: { ...current.liabilities[clientKey], creditCardMonthlyPaymentBalance: value } } }))} />
                    <Field label="Residence Loan – Monthly Pmt. / Balance" value={form.liabilities[clientKey].residenceLoanMonthlyPaymentBalance} onChange={(value) => setForm((current) => ({ ...current, liabilities: { ...current.liabilities, [clientKey]: { ...current.liabilities[clientKey], residenceLoanMonthlyPaymentBalance: value } } }))} />
                    <Field label="Auto Loan – Monthly Pmt. / Balance" value={form.liabilities[clientKey].autoLoanMonthlyPaymentBalance} onChange={(value) => setForm((current) => ({ ...current, liabilities: { ...current.liabilities, [clientKey]: { ...current.liabilities[clientKey], autoLoanMonthlyPaymentBalance: value } } }))} />
                    <Field label="Other Debt – Monthly Pmt. / Balance" value={form.liabilities[clientKey].otherDebtMonthlyPaymentBalance} onChange={(value) => setForm((current) => ({ ...current, liabilities: { ...current.liabilities, [clientKey]: { ...current.liabilities[clientKey], otherDebtMonthlyPaymentBalance: value } } }))} />
                  </div>
                </ArrayCard>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {(["client1", "client2"] as ClientKey[]).map((clientKey) => (
                <ArrayCard key={`estate-${clientKey}`} title={`Estate issues – ${clientKey === "client1" ? "Client 1" : "Client 2"}`}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <OwnerSelect value={form.estateIssues[clientKey].owner} onChange={(value) => setForm((current) => ({ ...current, estateIssues: { ...current.estateIssues, [clientKey]: { ...current.estateIssues[clientKey], owner: value } } }))} label="Client 1 or 2" />
                    <div />
                    <CheckboxCard label="Current Will" checked={form.estateIssues[clientKey].currentWill} onChange={(checked) => setForm((current) => ({ ...current, estateIssues: { ...current.estateIssues, [clientKey]: { ...current.estateIssues[clientKey], currentWill: checked } } }))} />
                    <CheckboxCard label="Living Will" checked={form.estateIssues[clientKey].livingWill} onChange={(checked) => setForm((current) => ({ ...current, estateIssues: { ...current.estateIssues, [clientKey]: { ...current.estateIssues[clientKey], livingWill: checked } } }))} />
                    <CheckboxCard label="Medical Power of Attorney" checked={form.estateIssues[clientKey].medicalPowerOfAttorney} onChange={(checked) => setForm((current) => ({ ...current, estateIssues: { ...current.estateIssues, [clientKey]: { ...current.estateIssues[clientKey], medicalPowerOfAttorney: checked } } }))} />
                    <CheckboxCard label="General Power of Attorney" checked={form.estateIssues[clientKey].generalPowerOfAttorney} onChange={(checked) => setForm((current) => ({ ...current, estateIssues: { ...current.estateIssues, [clientKey]: { ...current.estateIssues[clientKey], generalPowerOfAttorney: checked } } }))} />
                  </div>
                </ArrayCard>
              ))}
            </div>
          </Section>

          <Section eyebrow="Documents and advisors" title="Supporting documents, current advisors, and stated advice request" description="Includes the checklist under 'Items that may be needed', the Current Advisors lines, and the final comment box on the questionnaire.">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Items that may be needed</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <CheckboxCard label="Prior Year Tax Returns" checked={form.supportingDocuments.priorYearTaxReturns} onChange={(checked) => setForm((current) => ({ ...current, supportingDocuments: { ...current.supportingDocuments, priorYearTaxReturns: checked } }))} />
                <CheckboxCard label="Brokerage Account Statements" checked={form.supportingDocuments.brokerageAccountStatements} onChange={(checked) => setForm((current) => ({ ...current, supportingDocuments: { ...current.supportingDocuments, brokerageAccountStatements: checked } }))} />
                <CheckboxCard label="Trust Account Statements" checked={form.supportingDocuments.trustAccountStatements} onChange={(checked) => setForm((current) => ({ ...current, supportingDocuments: { ...current.supportingDocuments, trustAccountStatements: checked } }))} />
                <CheckboxCard label="Retirement Plan Account Statements" checked={form.supportingDocuments.retirementPlanAccountStatements} onChange={(checked) => setForm((current) => ({ ...current, supportingDocuments: { ...current.supportingDocuments, retirementPlanAccountStatements: checked } }))} />
                <CheckboxCard label="Loan Documents" checked={form.supportingDocuments.loanDocuments} onChange={(checked) => setForm((current) => ({ ...current, supportingDocuments: { ...current.supportingDocuments, loanDocuments: checked } }))} />
                <CheckboxCard label="Insurance Policies" checked={form.supportingDocuments.insurancePolicies} onChange={(checked) => setForm((current) => ({ ...current, supportingDocuments: { ...current.supportingDocuments, insurancePolicies: checked } }))} />
                <CheckboxCard label="Legal Documents" checked={form.supportingDocuments.legalDocuments} onChange={(checked) => setForm((current) => ({ ...current, supportingDocuments: { ...current.supportingDocuments, legalDocuments: checked } }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Attorney" value={form.currentAdvisors.attorney} onChange={(value) => setForm((current) => ({ ...current, currentAdvisors: { ...current.currentAdvisors, attorney: value } }))} />
              <Field label="Accountant" value={form.currentAdvisors.accountant} onChange={(value) => setForm((current) => ({ ...current, currentAdvisors: { ...current.currentAdvisors, accountant: value } }))} />
              <Field label="Insurance Agent" value={form.currentAdvisors.insuranceAgent} onChange={(value) => setForm((current) => ({ ...current, currentAdvisors: { ...current.currentAdvisors, insuranceAgent: value } }))} />
              <Field label="Stockbroker" value={form.currentAdvisors.stockbroker} onChange={(value) => setForm((current) => ({ ...current, currentAdvisors: { ...current.currentAdvisors, stockbroker: value } }))} />
            </div>

            <TextArea label="Comment on advice you are seeking" value={form.adviceSought} onChange={(value) => setForm((current) => ({ ...current, adviceSought: value }))} rows={5} placeholder="Describe the problems, goals, or decisions the clients want help with." />
          </Section>

          <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Generate advisor-ready analysis</h3>
              <p className="mt-1 text-sm text-slate-600">This analysis now receives the full questionnaire payload instead of the earlier simplified MVP fields.</p>
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
          {status === "error" ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </div>

        <aside className="w-full xl:sticky xl:top-8 xl:max-w-xl">
          <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Analysis</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Preliminary planning brief</h2>
              </div>
              {isAnalyzed ? <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{analysis.source === "openai" ? "OpenAI" : "Fallback engine"}</span> : null}
            </div>

            {!isAnalyzed ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-sm leading-7 text-slate-500">
                Submit the full intake to generate a more complete advisor briefing using both clients, dependents, assets, liabilities, insurance, estate issues, advisors, and document readiness.
              </div>
            ) : (
              <div className="space-y-5 text-sm text-slate-700">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Household snapshot</p>
                  <p className="mt-2 leading-7">{analysis.householdSummary}</p>
                  <p className="mt-3 text-xs text-slate-500"><span className="font-semibold text-slate-700">Life stage:</span> {analysis.lifeCycleStage.label} — {analysis.lifeCycleStage.reasoning}</p>
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
                      <div key={`${item.goal1}-${item.goal2}-${item.detail}`} className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-medium text-slate-900">{item.goal1} ↔ {item.goal2}</p>
                        <p className="mt-2 text-slate-600">{item.detail}</p>
                      </div>
                    )) : <p className="rounded-2xl bg-slate-50 p-4 text-slate-600">No major trade-offs identified yet from the current intake.</p>}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-emerald-50 p-5">
                    <h3 className="text-base font-semibold text-emerald-950">Strengths</h3>
                    <ul className="mt-3 space-y-2 text-emerald-900">{analysis.strengths.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                  <div className="rounded-3xl bg-amber-50 p-5">
                    <h3 className="text-base font-semibold text-amber-950">Risks / gaps</h3>
                    <ul className="mt-3 space-y-2 text-amber-900">{analysis.risks.map((item) => <li key={item}>• {item}</li>)}</ul>
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
                            <ul className="mt-2 space-y-1 text-slate-600">{direction.advantages.map((item) => <li key={item}>• {item}</li>)}</ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Drawbacks</p>
                            <ul className="mt-2 space-y-1 text-slate-600">{direction.drawbacks.map((item) => <li key={item}>• {item}</li>)}</ul>
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
                  <ul className="mt-3 space-y-2 rounded-3xl bg-slate-50 p-5 text-slate-700">{analysis.advisorQuestions.map((item) => <li key={item}>• {item}</li>)}</ul>
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
