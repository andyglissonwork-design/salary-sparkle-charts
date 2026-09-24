import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Salary Structures — Interactive Compensation Slide" },
      {
        name: "description",
        content:
          "Interactive slide presenting salary bands, ranges, and compa-ratios across job levels and departments.",
      },
      { property: "og:title", content: "Salary Structures — Interactive Compensation Slide" },
      {
        property: "og:description",
        content:
          "Interactive slide presenting salary bands, ranges, and compa-ratios across job levels and departments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalarySlide,
});

type Level = {
  level: string;
  title: string;
  min: number;
  mid: number;
  max: number;
  headcount: number;
  avgActual: number;
};

const DEPARTMENTS: Record<string, Level[]> = {
  Engineering: [
    { level: "L1", title: "Junior Engineer", min: 62, mid: 74, max: 86, headcount: 18, avgActual: 71 },
    { level: "L2", title: "Engineer", min: 78, mid: 94, max: 110, headcount: 34, avgActual: 92 },
    { level: "L3", title: "Senior Engineer", min: 105, mid: 128, max: 151, headcount: 27, avgActual: 131 },
    { level: "L4", title: "Staff Engineer", min: 138, mid: 166, max: 194, headcount: 11, avgActual: 158 },
    { level: "L5", title: "Principal Engineer", min: 172, mid: 205, max: 238, headcount: 5, avgActual: 198 },
    { level: "L6", title: "Distinguished", min: 210, mid: 252, max: 294, headcount: 2, avgActual: 240 },
  ],
  Product: [
    { level: "L1", title: "Associate PM", min: 68, mid: 82, max: 96, headcount: 9, avgActual: 80 },
    { level: "L2", title: "Product Manager", min: 88, mid: 106, max: 124, headcount: 15, avgActual: 108 },
    { level: "L3", title: "Senior PM", min: 112, mid: 136, max: 160, headcount: 10, avgActual: 130 },
    { level: "L4", title: "Group PM", min: 145, mid: 174, max: 203, headcount: 4, avgActual: 170 },
    { level: "L5", title: "Director of Product", min: 180, mid: 216, max: 252, headcount: 2, avgActual: 210 },
  ],
  Design: [
    { level: "L1", title: "Junior Designer", min: 58, mid: 70, max: 82, headcount: 7, avgActual: 68 },
    { level: "L2", title: "Designer", min: 72, mid: 88, max: 104, headcount: 12, avgActual: 86 },
    { level: "L3", title: "Senior Designer", min: 96, mid: 118, max: 140, headcount: 8, avgActual: 121 },
    { level: "L4", title: "Staff Designer", min: 126, mid: 152, max: 178, headcount: 3, avgActual: 148 },
    { level: "L5", title: "Design Director", min: 158, mid: 190, max: 222, headcount: 1, avgActual: 185 },
  ],
  Sales: [
    { level: "L1", title: "SDR", min: 45, mid: 55, max: 65, headcount: 22, avgActual: 53 },
    { level: "L2", title: "Account Executive", min: 62, mid: 78, max: 94, headcount: 19, avgActual: 80 },
    { level: "L3", title: "Senior AE", min: 84, mid: 104, max: 124, headcount: 11, avgActual: 101 },
    { level: "L4", title: "Sales Manager", min: 108, mid: 132, max: 156, headcount: 5, avgActual: 128 },
    { level: "L5", title: "VP Sales", min: 150, mid: 185, max: 220, headcount: 1, avgActual: 178 },
  ],
};

type View = "bands" | "distribution" | "compa";

const fmt = (v: number) => `$${v}k`;

function SalarySlide() {
  const [dept, setDept] = useState<string>("Engineering");
  const [view, setView] = useState<View>("bands");
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  const data = useMemo(
    () =>
      DEPARTMENTS[dept]!.map((l) => ({
        ...l,
        range: l.max - l.min,
        compa: Math.round((l.avgActual / l.mid) * 100),
      })),
    [dept],
  );

  const selected = (data.find((d) => d.level === activeLevel) ?? data[Math.min(2, data.length - 1)])!;
  const totalHeadcount = data.reduce((s, d) => s + d.headcount, 0);
  const avgCompa = Math.round(
    data.reduce((s, d) => s + (d.avgActual / d.mid) * 100 * d.headcount, 0) / totalHeadcount,
  );
  const topMax = Math.max(...data.map((d) => d.max));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      {/* Slide canvas — 16:9 */}
      <div className="relative aspect-video w-full max-w-7xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-10 pt-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Compensation Review · FY2026
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-card-foreground">
              Salary Structures by Level
            </h1>
          </div>
          <div className="flex gap-2">
            {(["bands", "distribution", "compa"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {v === "bands" ? "Salary Bands" : v === "distribution" ? "Headcount" : "Compa-Ratio"}
              </button>
            ))}
          </div>
        </div>

        {/* Department tabs */}
        <div className="mt-4 flex gap-2 px-10">
          {Object.keys(DEPARTMENTS).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDept(d);
                setActiveLevel(null);
              }}
              className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                dept === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Body: chart + detail panel */}
        <div className="mt-2 grid grid-cols-[1fr_280px] gap-6 px-10 pb-16">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              {view === "bands" ? (
                <ComposedChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="level" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmt} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip
                    cursor={{ fill: "var(--color-accent)" }}
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => [fmt(Number(v)), String(name)]}
                  />
                  {/* Invisible base to float the range bar */}
                  <Bar dataKey="min" stackId="band" fill="transparent" isAnimationActive={false} />
                  <Bar dataKey="range" stackId="band" radius={[6, 6, 6, 6]} fill="var(--color-chart-2)" opacity={0.35} name="Band range">
                    {data.map((d) => (
                      <Cell
                        key={d.level}
                        opacity={activeLevel && activeLevel !== d.level ? 0.15 : 0.45}
                        onMouseEnter={() => setActiveLevel(d.level)}
                        onMouseLeave={() => setActiveLevel(null)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="mid" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-chart-1)" }} name="Midpoint" />
                  <Line type="monotone" dataKey="avgActual" stroke="var(--color-primary)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4, fill: "var(--color-primary)" }} name="Avg actual" />
                </ComposedChart>
              ) : view === "distribution" ? (
                <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="level" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    cursor={{ fill: "var(--color-accent)" }}
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="headcount" radius={[6, 6, 0, 0]} name="Headcount">
                    {data.map((d) => (
                      <Cell
                        key={d.level}
                        fill={activeLevel === d.level ? "var(--color-chart-1)" : "var(--color-chart-2)"}
                        onMouseEnter={() => setActiveLevel(d.level)}
                        onMouseLeave={() => setActiveLevel(null)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <ComposedChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="level" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 120]} tickFormatter={(v: number) => `${v}%`} tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip
                    cursor={{ fill: "var(--color-accent)" }}
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`${Number(v)}%`, "Compa-ratio"]}
                  />
                  <Line type="monotone" dataKey={() => 100} stroke="var(--color-muted-foreground)" strokeDasharray="4 4" dot={false} name="Target (100%)" />
                  <Bar dataKey="compa" radius={[6, 6, 0, 0]} name="Compa-ratio">
                    {data.map((d) => (
                      <Cell
                        key={d.level}
                        fill={d.compa > 103 ? "var(--color-destructive)" : d.compa < 97 ? "var(--color-chart-4)" : "var(--color-chart-2)"}
                        opacity={activeLevel && activeLevel !== d.level ? 0.3 : 1}
                        onMouseEnter={() => setActiveLevel(d.level)}
                        onMouseLeave={() => setActiveLevel(null)}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Detail panel */}
          <div className="flex flex-col justify-center gap-4 rounded-xl border border-border bg-secondary/50 p-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{selected.level}</p>
              <p className="text-lg font-semibold text-card-foreground">{selected.title}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Band range</span><span className="font-medium text-card-foreground">{fmt(selected.min)} – {fmt(selected.max)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Midpoint</span><span className="font-medium text-card-foreground">{fmt(selected.mid)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg actual</span><span className="font-medium text-card-foreground">{fmt(selected.avgActual)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Compa-ratio</span><span className={`font-semibold ${selected.compa > 103 ? "text-destructive" : selected.compa < 97 ? "text-chart-4" : "text-chart-2"}`}>{selected.compa}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Headcount</span><span className="font-medium text-card-foreground">{selected.headcount}</span></div>
            </div>
            <div className="border-t border-border pt-3 text-xs text-muted-foreground">
              Hover any level in the chart to inspect it.
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border bg-secondary/40 px-10 py-3 text-xs text-muted-foreground">
          <span>{dept} · {data.length} levels · {totalHeadcount} employees</span>
          <span>Top of structure: {fmt(topMax)} · Avg compa-ratio: {avgCompa}%</span>
        </div>
      </div>
    </div>
  );
}
