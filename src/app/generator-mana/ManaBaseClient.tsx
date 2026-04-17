"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import {
  BASIC_COLORS,
  COLOR_ACCENT,
  COLOR_LABEL,
  COLOR_SVG,
  DUAL_PAIRS,
  type BasicColor,
  type LandRecommendation,
} from "@/lib/mtg/mana-base";

type Result = {
  recommendation: LandRecommendation;
  lands: { color: BasicColor; label: string; name: string; count: number }[];
  total: number;
};

type FormState = {
  pips: Record<BasicColor, number>;
  duals: Record<string, number>;
  utility: number;
  budget: number;
};

function Stepper({
  value,
  onChange,
  min = 0,
  max = 40,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/60 transition hover:bg-white/[0.10] hover:text-white active:scale-95"
      >
        −
      </button>
      <span className="w-6 text-center font-mono text-sm font-semibold text-white">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/60 transition hover:bg-white/[0.10] hover:text-white active:scale-95"
      >
        +
      </button>
    </div>
  );
}

// ─── Step 1: Form ─────────────────────────────────────────────────────────────

function FormStep({
  form,
  setForm,
  onCalculate,
  loading,
  error,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onCalculate: () => void;
  loading: boolean;
  error: string | null;
}) {
  const totalDuals = Object.values(form.duals).reduce((s, n) => s + n, 0);
  const totalNonBasics = totalDuals + form.utility;
  const totalPips = BASIC_COLORS.reduce((s, c) => s + form.pips[c], 0);

  function setPip(color: BasicColor, value: number) {
    setForm((f) => ({ ...f, pips: { ...f.pips, [color]: value } }));
  }

  function setDual(key: string, value: number) {
    setForm((f) => {
      const next = { ...f.duals };
      if (value === 0) delete next[key];
      else next[key] = value;
      return { ...f, duals: next };
    });
  }

  return (
    <div className="space-y-4">
      {/* Pip inputs */}
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="border-b border-white/8 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Pips de mana colorido
          </p>
          <p className="mt-0.5 text-[11px] text-white/25">
            Conte os símbolos coloridos nas cartas do deck (excluindo lands)
          </p>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {BASIC_COLORS.map((color) => (
            <div key={color} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-2.5">
                <Image src={COLOR_SVG[color]} alt={COLOR_LABEL[color]} width={20} height={20} className="h-5 w-5 shrink-0 object-contain" unoptimized />
                <span className="text-sm font-medium" style={{ color: COLOR_ACCENT[color] }}>
                  {COLOR_LABEL[color]}
                </span>
              </div>
              <Stepper value={form.pips[color]} onChange={(v) => setPip(color, v)} />
            </div>
          ))}
        </div>
      </section>

      {/* Dual lands */}
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="border-b border-white/8 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Dual lands
          </p>
          <p className="mt-0.5 text-[11px] text-white/25">
            Terrenos que produzem 2 cores específicas
          </p>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {DUAL_PAIRS.map((pair) => {
            const [a, b] = pair.colors;
            const count = form.duals[pair.key] ?? 0;
            return (
              <div key={pair.key} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Image src={COLOR_SVG[a]} alt={COLOR_LABEL[a]} width={16} height={16} className="h-4 w-4 shrink-0 object-contain" unoptimized />
                  <Image src={COLOR_SVG[b]} alt={COLOR_LABEL[b]} width={16} height={16} className="h-4 w-4 shrink-0 object-contain" unoptimized />
                  <span className={`text-sm ${count > 0 ? "text-white/80" : "text-white/40"}`}>
                    {pair.label}
                  </span>
                </div>
                <Stepper value={count} onChange={(v) => setDual(pair.key, v)} max={10} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Utility & budget */}
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="border-b border-white/8 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Outras lands e orçamento
          </p>
        </div>
        <div className="divide-y divide-white/[0.05]">
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="text-sm text-white/70">Utility lands</p>
              <p className="text-[11px] text-white/30">Produzem mana incolor</p>
            </div>
            <Stepper value={form.utility} onChange={(v) => setForm((f) => ({ ...f, utility: v }))} max={17} />
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="text-sm text-white/70">Total de lands no deck</p>
              <p className="text-[11px] text-white/30">Padrão: 17 para limited</p>
            </div>
            <Stepper value={form.budget} onChange={(v) => setForm((f) => ({ ...f, budget: v }))} min={1} max={40} />
          </div>
        </div>
        {totalNonBasics > 0 && (
          <div className="border-t border-white/8 bg-white/[0.02] px-5 py-3">
            <p className="text-[11px] text-white/35">
              Budget para basics:{" "}
              <span className="font-mono font-semibold text-white/60">
                {Math.max(0, form.budget - totalNonBasics)}
              </span>{" "}
              ({totalDuals > 0 && `${totalDuals} dual${totalDuals > 1 ? "s" : ""}`}
              {totalDuals > 0 && form.utility > 0 && " + "}
              {form.utility > 0 && `${form.utility} utility`} ocupam {totalNonBasics} slot{totalNonBasics > 1 ? "s" : ""})
            </p>
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300/80">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={onCalculate}
        disabled={loading || totalPips === 0}
        className="w-full rounded-full bg-white font-bold text-[#06070a] shadow-[0_0_20px_rgba(255,255,255,0.10)] hover:bg-white/90 disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#06070a]/30 border-t-[#06070a]" />
            Calculando…
          </span>
        ) : (
          "Calcular base de mana"
        )}
      </Button>
    </div>
  );
}

// ─── Step 2: Result ───────────────────────────────────────────────────────────

function ResultStep({
  result,
  form,
  onBack,
}: {
  result: Result;
  form: FormState;
  onBack: () => void;
}) {
  const totalDuals = Object.values(form.duals).reduce((s, n) => s + n, 0);
  const totalNonBasics = totalDuals + form.utility;
  const activeDuals = DUAL_PAIRS.filter((p) => (form.duals[p.key] ?? 0) > 0);
  const activePips = BASIC_COLORS.filter((c) => form.pips[c] > 0);

  return (
    <div className="space-y-4">
      {/* Summary of inputs */}
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="border-b border-white/8 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Deck analisado
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Pips</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {activePips.map((c) => (
                <div key={c} className="flex items-center gap-1">
                  <Image src={COLOR_SVG[c]} alt={COLOR_LABEL[c]} width={16} height={16} className="h-4 w-4 object-contain" unoptimized />
                  <span className="font-mono text-xs font-semibold text-white/70">{form.pips[c]}</span>
                </div>
              ))}
            </div>
          </div>
          {activeDuals.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Duals</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {activeDuals.map((pair) => (
                  <div key={pair.key} className="flex items-center gap-1">
                    <Image src={COLOR_SVG[pair.colors[0]]} alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" unoptimized />
                    <Image src={COLOR_SVG[pair.colors[1]]} alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" unoptimized />
                    <span className="font-mono text-xs font-semibold text-white/70">×{form.duals[pair.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Orçamento</p>
            <p className="mt-1 font-mono text-sm font-semibold text-white/70">
              {form.budget} lands
              {totalNonBasics > 0 && ` − ${totalNonBasics} especiais`}
            </p>
          </div>
        </div>
      </section>

      {/* Result cards */}
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="border-b border-white/8 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Terrenos básicos recomendados
          </p>
          <p className="mt-0.5 text-[11px] text-white/25">
            {result.total} básic{result.total === 1 ? "o" : "os"}
            {totalNonBasics > 0 && ` + ${totalNonBasics} especiai${totalNonBasics > 1 ? "s" : "s"}`}
            {" "}= {result.total + totalNonBasics} lands totais
          </p>
        </div>

        {result.lands.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/35">
            Nenhum terreno básico necessário
          </p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {result.lands.map(({ color, label, name, count }) => {
              const accent = COLOR_ACCENT[color as BasicColor];
              const pct = result.total > 0 ? Math.round((count / result.total) * 100) : 0;
              return (
                <div key={color} className="flex items-center gap-4 px-5 py-4">
                  <Image src={COLOR_SVG[color as BasicColor]} alt={name} width={24} height={24} className="h-6 w-6 shrink-0 object-contain" unoptimized />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: accent }}>
                      {label}
                    </p>
                    <p className="text-[11px] text-white/30">{name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: accent }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-xl font-black text-white">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="w-full rounded-full border-white/10 bg-transparent text-white/60 hover:bg-white/[0.06] hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar e ajustar
      </Button>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM: FormState = {
  pips: { W: 0, U: 0, B: 0, R: 0, G: 0 },
  duals: {},
  utility: 0,
  budget: 17,
};

export function ManaBaseClient() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mana-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Erro ao calcular");
        return;
      }
      setResult((await res.json()) as Result);
    } catch {
      setError("Falha na requisição");
    } finally {
      setLoading(false);
    }
  }

  const step = result ? "result" : "form";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none absolute left-[-140px] top-[42%] h-[320px] w-[320px] rounded-full bg-[#4d6393] opacity-13 blur-[130px]" />
      <div className="pointer-events-none absolute left-[40px] top-[68%] h-[260px] w-[260px] rounded-full bg-[#7c3aed] opacity-11 blur-[120px]" />
      <div className="pointer-events-none absolute right-[120px] top-[10%] h-[500px] w-[500px] rounded-full bg-[#4d6393] opacity-40 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[180px] h-[380px] w-[380px] rounded-full bg-[#7c3aed] opacity-25 blur-[110px]" />

      <div className="relative mx-auto flex max-w-lg flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="shrink-0 px-1 pb-6">
          <TopNav activePage="mana" />
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.38em] text-white/35">
                {step === "form" ? "Ferramenta" : "Resultado"}
              </p>
              <h1 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
                Base de mana
              </h1>
              {step === "form" && (
                <p className="mt-1.5 text-sm text-white/40">
                  Informe os pips e as lands especiais para calcular os terrenos básicos.
                </p>
              )}
            </div>
            {step === "form" && (
              <div className="flex shrink-0 items-center gap-2 pb-1">
                <div className="h-1.5 w-6 rounded-full bg-white/80" />
                <div className="h-1.5 w-6 rounded-full bg-white/20" />
              </div>
            )}
            {step === "result" && (
              <div className="flex shrink-0 items-center gap-2 pb-1">
                <div className="h-1.5 w-6 rounded-full bg-white/20" />
                <div className="h-1.5 w-6 rounded-full bg-white/80" />
              </div>
            )}
          </div>
        </header>

        {step === "form" || result === null ? (
          <FormStep
            form={form}
            setForm={setForm}
            onCalculate={handleCalculate}
            loading={loading}
            error={error}
          />
        ) : (
          <ResultStep
            result={result}
            form={form}
            onBack={() => {
              setResult(null);
              setError(null);
            }}
          />
        )}
      </div>
    </main>
  );
}
