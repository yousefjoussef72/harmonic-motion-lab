import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { SpringStage } from "@/components/spring-stage";
import {
  LEVELS,
  fmt,
  freqOf,
  omegaOf,
  periodOf,
  phaseName,
  stateAt,
  type Level,
} from "@/lib/physics";

const NAV = [
  ["lab", "المعمل"],
  ["symbols", "الرموز"],
  ["hooke", "هوك"],
  ["period", "الزمن"],
  ["cycle", "دورة"],
  ["energy", "الطاقة"],
  ["examples", "أمثلة"],
  ["whatif", "ماذا يحدث"],
  ["origins", "منين القانون"],
  ["quiz", "تدريب"],
] as const;

type Layer = { take: string; weak: string; strong: string; sharp: string };

function body(level: Level, item: Layer) {
  if (level === "weak") return item.weak;
  if (level === "strong") return item.strong;
  return item.sharp;
}

export function LabApp() {
  const [level, setLevel] = useState<Level>("weak");
  const [m, setM] = useState(0.2);
  const [k, setK] = useState(80);
  const [A, setA] = useState(0.08);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ruler, setRuler] = useState(20);
  const [metroM, setMetroM] = useState(12000);
  const [metroK, setMetroK] = useState(180000);
  const playRef = useRef(playing);
  playRef.current = playing;

  const T = periodOf(k, m);
  const sim = stateAt(k, m, A, (phase / (2 * Math.PI)) * T);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playRef.current) {
        const omega = omegaOf(k, m);
        setPhase((p) => (p + omega * dt) % (2 * Math.PI));
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [k, m]);

  const place = phaseName(sim.phase, sim.T);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-teal">تانية بكالوريا · فيزياء</p>
              <h1 className="text-xl font-semibold">معمل الحركة التوافقية</h1>
            </div>
            <LevelSwitch level={level} onChange={setLevel} />
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="shrink-0 rounded-full border border-line bg-surface px-3 py-2 text-sm"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <section id="lab" className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">السوستة قدامك</h2>
              <p className="text-sm text-muted">زوّد أو نقص، وشوف القوة والسرعة والطاقة في نفس اللحظة.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal px-4 text-surface"
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
                {playing ? "إيقاف" : "تشغيل"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setPhase(0);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4"
              >
                <RotateCcw size={16} />
                الطرف
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-line">
            <SpringStage x={sim.x} A={A} F={sim.F} v={sim.v} />
          </div>
          <p className="mt-3 text-sm">
            المكان دلوقتي: <strong>{place}</strong>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Slider label="الكتلة m" unit="kg" min={0.1} max={2} step={0.05} value={m} onChange={setM} />
            <Slider label="صلابة السوستة k" unit="N/m" min={10} max={200} step={1} value={k} onChange={setK} />
            <Slider label="السعة A" unit="cm" min={2} max={12} step={0.5} value={A * 100} onChange={(cm) => setA(cm / 100)} />
          </div>
          <label className="mt-4 block text-sm">
            <span className="flex justify-between">
              <span>موضع الدورة</span>
              <span dir="ltr">{fmt((sim.phase / sim.T) * 100, 0)}%</span>
            </span>
            <input
              type="range"
              dir="ltr"
              min={0}
              max={1000}
              value={Math.round((sim.phase / sim.T) * 1000) % 1000}
              onChange={(e) => {
                setPlaying(false);
                setPhase((Number(e.target.value) / 1000) * 2 * Math.PI);
              }}
              className="w-full"
            />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Read label="T" value={`${fmt(sim.T)} s`} />
            <Read label="f" value={`${fmt(sim.f)} Hz`} />
            <Read label="ω" value={`${fmt(sim.omega)} rad/s`} />
            <Read label="E" value={`${fmt(sim.E)} J`} />
            <Read label="x" value={`${fmt(sim.x)} m`} />
            <Read label="v" value={`${fmt(sim.v)} m/s`} />
            <Read label="a" value={`${fmt(sim.a)} m/s²`} />
            <Read label="F" value={`${fmt(sim.F)} N`} />
          </div>
          <Note
            level={level}
            item={{
              take: "القوة دايمًا تشد الجسم راجع للاتزان، والسرعة أكبر ما تكون هناك.",
              weak: "لو سحبت الكتلة وسبتها، السوستة ترجّعها. كل ما تبعد، الشد أقوى. في النص سرعتها أعلى، وعند الطرف تقف لحظة وترجع.",
              strong: "F = −kx و a = −ω²x. السالب اتجاه: عكس الإزاحة. عند x = ±A السرعة صفر والقوة والعجلة أكبر حاجة. عند x = 0 القوة والعجلة صفر، والسرعة v_max = ωA.",
              sharp: "الإشارة مش ناتجة من التعويض؛ اتضافت عشان المحصلة نحو الاتزان. من غير السالب القوة تهرب بالجسم. v_max = ωA جاية من حفظ الطاقة عند الاتزان مش من قانون هوك، لأن هوك عند x = 0 بيدي F = 0 ومش بيقول قيمة السرعة.",
            }}
          />
        </section>

        <Dictionary />
        <Hooke level={level} k={k} />
        <Period level={level} m={m} k={k} A={A} />
        <Cycle level={level} simPhase={sim.phase} T={sim.T} />
        <Energy level={level} sim={sim} />
        <Examples
          level={level}
          onLoad={(nm, nk, nA) => {
            setM(nm);
            setK(nk);
            setA(nA);
            setPhase(0);
            setPlaying(false);
          }}
        />
        <WhatIf level={level} m={m} k={k} A={A} />
        <RulerMetro
          level={level}
          ruler={ruler}
          setRuler={setRuler}
          metroM={metroM}
          setMetroM={setMetroM}
          metroK={metroK}
          setMetroK={setMetroK}
        />
        <Origins level={level} />
        <Quiz level={level} />
      </main>
    </div>
  );
}

function LevelSwitch({ level, onChange }: { level: Level; onChange: (l: Level) => void }) {
  return (
    <div className="flex rounded-full border border-line bg-surface p-1">
      {LEVELS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`min-h-11 rounded-full px-3 text-sm ${level === item.id ? "bg-teal text-surface" : ""}`}
          title={item.hint}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span dir="ltr" className="font-medium text-teal">
          {fmt(value, 2)} {unit}
        </span>
      </span>
      <input
        type="range"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

function Read({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg px-3 py-2">
      <div className="text-xs text-muted" dir="ltr">
        {label}
      </div>
      <div className="font-medium" dir="ltr">
        {value}
      </div>
    </div>
  );
}

function Note({ level, item }: { level: Level; item: Layer }) {
  return (
    <div className="mt-4 rounded-xl bg-teal-soft p-3 text-sm">
      <p className="font-medium">{item.take}</p>
      <p className="mt-1 text-ink/90">{body(level, item)}</p>
    </div>
  );
}

function Card({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Dictionary() {
  const rows = [
    ["x", "الإزاحة", "بعد الجسم دلوقتي عن الاتزان. يمين موجب وشمال سالب", "m"],
    ["A", "السعة", "أكبر بعد يوصله الجسم. دايمًا موجبة", "m"],
    ["T", "الزمن الدوري", "زمن اهتزازة كاملة: روح وارجع لنفس الحالة", "s"],
    ["f", "التردد", "عدد الاهتزازات في ثانية", "Hz"],
    ["ω", "التردد الزاوي", "كام راديان في الثانية. أكبر من f بمقدار 2π", "rad/s"],
    ["k", "ثابت النابض", "صلابة السوستة. كل ما كبر، السوستة أقسى", "N/m"],
    ["m", "الكتلة", "كتلة الجسم المهتز", "kg"],
    ["F", "قوة الاستعادة", "تشد الجسم راجع للاتزان، عكس الإزاحة", "N"],
    ["a", "العجلة", "تسارع نحو الاتزان", "m/s²"],
    ["v", "السرعة", "سرعة اللحظة دي", "m/s"],
    ["Ep", "طاقة الوضع", "متخزنة في السوستة وهي مشدودة أو مضغوطة", "J"],
    ["Ek", "طاقة الحركة", "لأن الجسم بيتحرك", "J"],
    ["E", "الطاقة الميكانيكية", "مجموعهما، ثابت لو مفيش احتكاك", "J"],
  ];
  return (
    <Card id="symbols" title="قاموس الرموز">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-line text-right text-muted">
              <th className="py-2 font-medium">الرمز</th>
              <th className="font-medium">اسمه</th>
              <th className="font-medium">معناه</th>
              <th className="font-medium">الوحدة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-line">
                <td className="py-2 font-medium" dir="ltr">
                  {r[0]}
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td dir="ltr">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm" dir="ltr">
        f = 1/T · ω = 2πf = 2π/T · T = 2π/ω
      </p>
    </Card>
  );
}

function Hooke({ level, k }: { level: Level; k: number }) {
  const [xCm, setXCm] = useState(4);
  const x = xCm / 100;
  const F = -k * x;
  return (
    <Card id="hooke" title="قانون هوك">
      <p className="text-sm" dir="ltr">
        F = −kx · k = {fmt(k, 1)} N/m · F = {fmt(F, 2)} N
      </p>
      <div className="mt-3">
        <Slider label="إزاحة التجربة" unit="cm" min={-12} max={12} step={0.5} value={xCm} onChange={setXCm} />
      </div>
      <p className="mt-2 text-sm">
        {xCm === 0
          ? "عند الاتزان القوة صفر."
          : xCm > 0
            ? "الجسم يمين الاتزان، فالقوة شمال (سالبة)."
            : "الجسم شمال الاتزان، فالقوة يمين (موجبة)."}
      </p>
      <Note
        level={level}
        item={{
          take: "قدّ الاستطالة تكون القوة، جوه حدود المرونة، والاتجاه دايمًا للاتزان.",
          weak: "هوك جرّب: كل ما تشد السوستة أكتر، المقاومة تكبر بنفس النسبة. مش قانون اتنفخ من الكتاب فجأة.",
          strong: "F = −kx. k ميل خط القوة مع الإزاحة، ووحدته N/m. السالب يعني القوة عكس x. الرسم خط يعدّي الأصل، وده صحيح جوه حدود المرونة بس.",
          sharp: "القانون تجربة مش اشتقاق من نيوتن. الجملة اللاتينية معناها: قد الاستطالة تكون القوة. السالب اتضاف بالاتفاق عشان الاتجاه. لو المسألة قالت F = −30x يبقى k = 30، الرقم اللي قدام x هو الصلابة.",
        }}
      />
    </Card>
  );
}

function Period({ level, m, k, A }: { level: Level; m: number; k: number; A: number }) {
  const T = periodOf(k, m);
  const w = omegaOf(k, m);
  const f = freqOf(k, m);
  return (
    <Card id="period" title="منين طلع زمن الاهتزازة">
      <ol className="grid gap-2 text-sm">
        <li className="rounded-xl bg-bg p-3" dir="ltr">
          1) F = ma و F = −kx ⇒ a = −(k/m) x
        </li>
        <li className="rounded-xl bg-bg p-3" dir="ltr">
          2) تعريف التوافقية: a = −ω²x ⇒ ω² = k/m
        </li>
        <li className="rounded-xl bg-bg p-3" dir="ltr">
          3) T = 2π/ω ⇒ T = 2π √(m/k) = {fmt(T)} s
        </li>
      </ol>
      <p className="mt-3 text-sm" dir="ltr">
        ω = {fmt(w)} rad/s · f = {fmt(f)} Hz · A = {fmt(A)} m لا يدخل في T
      </p>
      <Note
        level={level}
        item={{
          take: "الكتلة تبطّئ الاهتزازة، والسوستة القاسية تسرّعها. السعة ما تغيّرش الزمن.",
          weak: "تخيّل أرجوحة: الطفل التقيل يتأخر، والحبل المشدود يرجعك أسرع. مسافة الدفعة الأولى مش هي اللي بتحدد الزمن، طول ما الحاجة ما اتكسرتش.",
          strong: "T = 2π√(m/k). إذن T يزيد مع جذر الكتلة ويقل مع جذر الصلابة. A مش في القانون، فالسعة ما تغيّرش T جوه حدود المرونة. ω = √(k/m) و f = ω/(2π).",
          sharp: "الخطوة الحاسمة مقارنة معاملين: a = −(k/m)x من نيوتن وهوك، و a = −ω²x من تعريف التوافقية. ω مش جاية من النابض لوحدها؛ 2π جاية من إن الدورة الكاملة = 2π راديان، والنابض بس بيحدد قيمة ω. لو اتغيرت m أو k اشتغل بالنسبة: T ∝ √m و T ∝ 1/√k.",
        }}
      />
    </Card>
  );
}

function Cycle({ level, simPhase, T }: { level: Level; simPhase: number; T: number }) {
  const u = simPhase / T;
  const rows = [
    ["0", "+A", "0", "عظمى نحو الاتزان"],
    ["T/4", "0", "عظمى", "0"],
    ["T/2", "−A", "0", "عظمى نحو الاتزان"],
    ["3T/4", "0", "عظمى عكس اللي فاتت", "0"],
    ["T", "+A", "0", "زي الأول"],
  ];
  const active = u < 0.12 || u > 0.88 ? 0 : u < 0.37 ? 1 : u < 0.62 ? 2 : u < 0.87 ? 3 : 4;
  return (
    <Card id="cycle" title="شكل دورة واحدة">
      <p className="mb-3 text-sm text-muted">لو بدأنا من أقصى اليمين. الصف الملوّن هو مكانك في المعمل.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2 text-right font-medium">اللحظة</th>
              <th className="text-right font-medium">x</th>
              <th className="text-right font-medium">v</th>
              <th className="text-right font-medium">a</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r[0]} className={i === active ? "bg-teal-soft" : "border-b border-line"}>
                {r.map((c, j) => (
                  <td key={`${r[0]}-${j}`} className="py-2" dir="ltr">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Wave u={u} />
      <Note
        level={level}
        item={{
          take: "السرعة صفر عند الطرف، والعجلة صفر في النص. المنحنيان مش منطبقين.",
          weak: "الجسم يقف لحظة عند آخر السحبة، وبعدين يعدّي النص بأسرع ما يكون. العجلة عكس كده: أقوى عند الطرف وصفر في النص.",
          strong: "فرق الطور بين الإزاحة والسرعة ربع دورة. v = 0 عند t = 0 و T/2 و T. a = 0 عند T/4 و 3T/4. |v|_max = ωA و |a|_max = ω²A و |F|_max = kA.",
          sharp: "منحنى الجيب ومشتقته متزاحان بربع دورة، عشان كده ما بينطبقوش. بداية الكتاب من +A يعني x = A cos(ωt). مثال الجيب x = A sin(ωt) يبدأ من الاتزان مش من الطرف. متخلطش بين صورة المسألة.",
        }}
      />
    </Card>
  );
}

function Wave({ u }: { u: number }) {
  const w = 320;
  const h = 92;
  const pts = (fn: (t: number) => number) => {
    let d = "";
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const x = 8 + t * (w - 16);
      const y = h / 2 - fn(t) * 32;
      d += `${i === 0 ? "M" : "L"} ${x} ${y} `;
    }
    return d;
  };
  const mx = 8 + u * (w - 16);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" role="img" aria-label="منحنى الإزاحة والسرعة">
      <path d={pts((t) => Math.cos(2 * Math.PI * t))} fill="none" stroke="var(--color-teal)" strokeWidth="2" />
      <path d={pts((t) => -Math.sin(2 * Math.PI * t))} fill="none" stroke="var(--color-copper)" strokeWidth="2" />
      <line x1={mx} y1="8" x2={mx} y2={h - 8} stroke="var(--color-ink)" strokeDasharray="3 3" />
      <text x="12" y="16" fill="var(--color-teal)" fontSize="11">
        إزاحة
      </text>
      <text x="12" y="30" fill="var(--color-copper)" fontSize="11">
        سرعة
      </text>
    </svg>
  );
}

function Energy({
  level,
  sim,
}: {
  level: Level;
  sim: ReturnType<typeof stateAt>;
}) {
  const e = Math.max(sim.E, 1e-9);
  return (
    <Card id="energy" title="الطاقة بتتبادل ومش بتضيع">
      <Bar label="طاقة الوضع" frac={sim.Ep / e} tone="copper" text={`${fmt(sim.Ep)} J`} />
      <Bar label="طاقة الحركة" frac={sim.Ek / e} tone="teal" text={`${fmt(sim.Ek)} J`} />
      <p className="mt-3 text-sm" dir="ltr">
        Ep = ½kx² · Ek = ½mv² · E = ½kA² = {fmt(sim.E)} J
      </p>
      <p className="mt-2 text-sm">
        عند نص السعة، الوضع ربع الطاقة والباقي حركة: لأن التربيع يخلّي (A/2)² = A²/4.
      </p>
      <Note
        level={level}
        item={{
          take: "عند الطرف الطاقة كلها وضع، وفي النص كلها حركة. المجموع ثابت.",
          weak: "السوستة المشدودة زي زنبرك لعبة مخزّن دفع. لما الجسم يعدّي النص، الدفع ده بقى سرعة. من غير احتكاك المجموع ما ينقصش.",
          strong: "Ep أكبر عند ±A وصفر عند الاتزان. Ek عكسها. E = ½kA² ثابت. عند x = A/2 تبقى Ep = E/4 و Ek = 3E/4.",
          sharp: "Ep = ½kx² من الشغل: القوة بتبدأ من صفر وتوصل kx، والمتوسط ½kx، في الشغل ½kx · x. الثابت بتاع E اتقاس عند الطرف لأن v = 0. ومنه عند الاتزان ½mv²_max = ½kA² فيطلع v_max = ωA لأن ω² = k/m. لو A اتضعفت، E تبقى 4 أمثال مش الضعف.",
        }}
      />
    </Card>
  );
}

function Bar({ label, frac, tone, text }: { label: string; frac: number; tone: "teal" | "copper"; text: string }) {
  const pct = Math.max(0, Math.min(100, frac * 100));
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span dir="ltr">{text}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-bg">
        <div className={`h-full ${tone === "teal" ? "bg-teal" : "bg-copper"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const EXAMPLES = [
  {
    title: "مثال 1",
    m: 0.2,
    k: 80,
    A: 0.05,
    lines: ["ω = √(80 / 0.20) = √400 = 20 rad/s", "T = 2 × 3.14 / 20 = 0.314 s ≈ 0.31 s", "f ≈ 3.18 Hz"],
  },
  {
    title: "مثال 2",
    m: 0.3,
    k: 30,
    A: 0.05,
    lines: ["F = −30x يعني k = 30 N/m", "ω = √(30 / 0.30) = 10 rad/s", "T = 2 × 3.14 / 10 = 0.628 s ≈ 0.63 s"],
  },
  {
    title: "مثال 3",
    m: 0.5,
    k: 2,
    A: 0.05,
    lines: ["F = −2.0x يعني k = 2.0 N/m", "T = 2π √(0.50 / 2.0) = 2π × 0.5 = π s ≈ 3.14 s"],
  },
];

function Examples({
  level,
  onLoad,
}: {
  level: Level;
  onLoad: (m: number, k: number, A: number) => void;
}) {
  return (
    <Card id="examples" title="أمثلة الكتاب على المعمل">
      <div className="grid gap-3 md:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <article key={ex.title} className="rounded-xl border border-line p-3">
            <h3 className="font-medium">{ex.title}</h3>
            <p className="mt-1 text-sm text-muted" dir="ltr">
              m = {ex.m} kg · k = {ex.k} N/m
            </p>
            <ul className="mt-2 space-y-1 text-sm" dir="ltr">
              {ex.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 min-h-11 rounded-full bg-teal px-3 text-sm text-surface"
              onClick={() => onLoad(ex.m, ex.k, ex.A)}
            >
              جرّبها في المعمل
            </button>
          </article>
        ))}
      </div>
      <article className="mt-3 rounded-xl border border-line p-3 text-sm">
        <h3 className="font-medium">مثال الإزاحة</h3>
        <p className="mt-1" dir="ltr">
          x = 0.50 sin(8.0π t)
        </p>
        <p className="mt-1">الرقم بره الجيب سعة: A = 0.50 m. الرقم جوه قدام t هو ω = 8π rad/s. إذن T = 2π/ω = 0.25 s و f = 4 Hz. عند t = 0 الجيب صفر، فالجسم بادئ من الاتزان مش من الطرف.</p>
      </article>
      <Note
        level={level}
        item={{
          take: "لو شفت رقمًا قدام x في القوة، الرقم ده هو k. ولو شفت جيب، بره سعة وجوه ω.",
          weak: "متخافش من شكل المسألة. دور على الرقم اللي قدام الإزاحة، ده صلابة السوستة. بعد كده نفس قانون الزمن.",
          strong: "من F = −(رقم)x خد k موجب. من x = A sin(ωt) أو cos: بره = A، جوه = ω، وبعدين T = 2π/ω. متحوّلش ω لتردد من غير قسمة على 2π.",
          sharp: "في مثال 1 الكتاب استخدم 3.14 مش π كامل، عشان كده 0.314 s. الحل الدقيق 2π/20 ≈ 0.31416. الفرق مش غلط فيزيائي. وفي مثال الجيب، الطور صفر يعني البداية اتزان؛ لو المسألة بدأت من الطرف هتبقى جيب تمام أو زاوية طور π/2.",
        }}
      />
    </Card>
  );
}

function WhatIf({ level, m, k, A }: { level: Level; m: number; k: number; A: number }) {
  const T = periodOf(k, m);
  const w = omegaOf(k, m);
  const rows = [
    ["الكتلة 4m و k ثابت", `T' = ${fmt(2 * T)} s = 2T`, `f' = ${fmt(freqOf(k, m) / 2)} Hz = f/2`],
    ["الصلابة 9k والكتلة ثابتة", `T' = ${fmt(T / 3)} s = T/3`, `ω' = ${fmt(3 * w)} = 3ω`],
    ["السعة 2A و m,k ثابتين", `Fmax' = ${fmt(k * 2 * A)} N = 2 Fmax`, `E' = ${fmt(0.5 * k * (2 * A) ** 2)} J = 4E · T ما يتغيرش`],
  ];
  return (
    <Card id="whatif" title="ماذا يحدث لو غيّرنا حاجة">
      <p className="mb-3 text-sm text-muted">الأرقام من قيم المعمل دلوقتي، والنسبة هي اللي بتيجي في الامتحان.</p>
      <div className="grid gap-3">
        {rows.map((r) => (
          <article key={r[0]} className="rounded-xl bg-bg p-3 text-sm">
            <h3 className="font-medium">{r[0]}</h3>
            <p className="mt-1" dir="ltr">
              {r[1]}
            </p>
            <p dir="ltr">{r[2]}</p>
          </article>
        ))}
      </div>
      <Note
        level={level}
        item={{
          take: "اسأل: اللي اتغير داخل الجذر ولا لأ؟ السعة ما تدخلش في الزمن، وتدخل مربعة في الطاقة.",
          weak: "لو الوزن بقى 4 أمثال، الزمن يتضاعف مش 4 أمثال، لأن في جذر. لو السوستة أقسى 9 مرات، الزمن يبقى التلت. لو سحبت ضعف المسافة، الزمن زي ما هو بس الطاقة تكبر أربع مرات.",
          strong: "T ∝ √m و T ∝ 1/√k. 4m → ×2. 9k → ÷3 و ω ×3. 2A → Fmax و amax ×2، و E ×4 لأن A²، و T ثابت.",
          sharp: "متحسبش أرقام لو السؤال قال كام مثل. اكتب النسبة وخلاص: T'/T = √(m'/m). فخ السعة إن الطالب يضاعف الطاقة مع A، وينسى التربيع. وعلى الرسم: 4m تمدّد الموجة لنفس السعة ودورة 2T. 9k تحط 3 موجات في زمن الموجة القديمة.",
        }}
      />
    </Card>
  );
}

function RulerMetro({
  level,
  ruler,
  setRuler,
  metroM,
  setMetroM,
  metroK,
  setMetroK,
}: {
  level: Level;
  ruler: number;
  setRuler: (n: number) => void;
  metroM: number;
  setMetroM: (n: number) => void;
  metroK: number;
  setMetroK: (n: number) => void;
}) {
  const keff = 40 * (20 / ruler) ** 3;
  const meff = 0.04;
  const fR = freqOf(keff, meff);
  const Tm = periodOf(metroK, metroM);
  return (
    <Card id="cases" title="المسطرة وعربة المترو">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-medium">مسطرة مثبّتة من طرف</h3>
          <Slider label="الطول الحر" unit="cm" min={12} max={20} step={0.5} value={ruler} onChange={setRuler} />
          <p className="mt-2 text-sm" dir="ltr">
            k_eff ≈ {fmt(keff, 1)} N/m · f ≈ {fmt(fR, 1)} Hz
          </p>
          <p className="mt-1 text-sm">{ruler < 16 ? "أقصر: أصلب، تردد أعلى، صوت أحدّ." : "أطول: أصلب أقل، تردد أقل، صوت أغلظ."}</p>
        </div>
        <div>
          <h3 className="font-medium">تعليق المترو</h3>
          <Slider label="كتلة العربة وحمولتها" unit="kg" min={8000} max={24000} step={500} value={metroM} onChange={setMetroM} />
          <Slider label="الصلابة المكافئة" unit="kN/m" min={80} max={400} step={10} value={metroK / 1000} onChange={(v) => setMetroK(v * 1000)} />
          <p className="mt-2 text-sm" dir="ltr">
            T = 2π √(m / K_eff) = {fmt(Tm)} s
          </p>
        </div>
      </div>
      <Note
        level={level}
        item={{
          take: "نفس قانون النابض. اللي بيتغير اسم الصلابة: فعالة للمسطرة، ومكافئة للمترو.",
          weak: "المسطرة القصيرة أصعب تتثني، فتهز أسرع وصوتها أحدّ. المترو التقيل يهتز أبطأ. المعدن نفسه ما اتغيرش.",
          strong: "f = (1/2π) √(k_eff / m_eff). تقصير الطول الحر يزوّد k_eff فيرفع f. للمترو T = 2π√(m/K_eff): الحمولة تزوّد T، والسوست الأقسى تقلله.",
          sharp: "مفيش اشتقاق جديد. قوة السوست مجتمعة لسه F ≈ −K_eff x، وبعدين نفس مقارنة العجلة. رقم المسطرة هنا نموذج تعليمي يتبع فكرة العارضة (الصلابة تتغير بشدة مع الطول) عشان تشوف الاتجاه، مش ثابتًا محفوظًا من الكتاب. اللي يتحفظ: التردد يزيد لما الصلابة الفعالة تزيد.",
        }}
      />
    </Card>
  );
}

const CHAIN = [
  ["T = t/N و f = 1/T", "تعريف. مش متستنتج. عشر اهتزازات عشان الغلطة تتقسم."],
  ["ω = 2π/T", "الدورة الكاملة = 2π راديان. مش جاية من النابض."],
  ["F = −kx", "تجربة هوك. السالب اتجاه نحو الاتزان."],
  ["a = −(k/m)x", "نيوتن F = ma مع هوك."],
  ["ω = √(k/m)", "مقارنة a = −ω²x مع a = −(k/m)x."],
  ["T = 2π√(m/k)", "تعويض ω في تعريف T."],
  ["Ep = ½kx² و E = ½kA²", "شغل القوة المتوسطة، ثم الحفظ عند الطرف حيث v = 0."],
  ["v_max = ωA", "الحفظ عند الاتزان: الحركة تاخد كل الطاقة."],
];

function Origins({ level }: { level: Level }) {
  return (
    <Card id="origins" title="كل قانون جاي منين">
      <ol className="grid gap-2">
        {CHAIN.map(([law, from], i) => (
          <li key={law} className="rounded-xl border border-line p-3 text-sm">
            <span className="text-teal">{i + 1}.</span> <span dir="ltr">{law}</span>
            <p className="mt-1 text-muted">{from}</p>
          </li>
        ))}
      </ol>
      <Note
        level={level}
        item={{
          take: "متبدّلش الترتيب: تعريف، وبعدين هوك، وبعدين نيوتن، وبعدين المقارنة، وبعدين الزمن، وبعدين الطاقة.",
          weak: "كل رمز ليه معنى واحد. لو نسيت القانون، ارجع للمعنى: إيه اللي بيتقاس، وإيه اللي بيرجّع الجسم.",
          strong: "احفظ السلسلة مش القوانين منفصلة. السؤال «علّل» غالبًا عايز الحلقة اللي قبل القانون، مش إعادة كتابته.",
          sharp: "x = A sin(ωt) حل جاهز لمعادلة a = −ω²x، والكتاب مش بيطلب اشتقاقها بالتفاضل في الصفحة دي. مصدرها إن المشتقة التانية للجيب ترجّعه بإشارة سالب. الطور يتحدد من مكان الجسم عند t = 0.",
        }}
      />
    </Card>
  );
}

const QUIZ = [
  {
    q: "السرعة تكون أكبر ما يمكن فين؟",
    options: ["عند موضع الاتزان", "عند أقصى إزاحة", "عند نص السعة بس"],
    answer: 0,
    why: {
      weak: "في النص السوستة مش مخزّنة شد، فكل الطاقة بقى سرعة.",
      strong: "عند x = 0 تبقى Ep = 0 و Ek عظمى و v = ωA. عند الطرف v = 0.",
      sharp: "هوك عند الاتزان بيدي F = 0 ومش بيحدد السرعة. القيمة جاية من حفظ الطاقة.",
    },
  },
  {
    q: "عند أقصى إزاحة، قوة الاستعادة...",
    options: ["صفر لأن الجسم واقف", "أكبر ما يمكن", "بتساوي الوزن"],
    answer: 1,
    why: {
      weak: "واقف لحظة، بس السوستة مشدودة آخر حاجة، فالشد أقوى حاجة.",
      strong: "|F| = k|x| وأكبر |x| هو A، فـ Fmax = kA. الوقوف اللحظي للسرعة مش للقوة.",
      sharp: "فخ كلاسيكي: يربط F = 0 بالسكون. السكون عند الطرف لأن الاتجاه بيتغير، والقوة هناك عظمى وهي اللي هترجّعه.",
    },
  },
  {
    q: "الكتلة بقت 4m والنابض هو هو. الزمن الدوري...",
    options: ["يتضاعف", "يبقى 4 أمثال", "ما يتغيرش"],
    answer: 0,
    why: {
      weak: "أتقل أربعة مش معناه أبطأ أربعة. في جذر، فيبقى أبطأ مرتين.",
      strong: "T ∝ √m و √4 = 2، إذن T' = 2T و f' = f/2.",
      sharp: "ω كمان تبقى النص لأن m تحت الجذر في المقام. السعة على الرسم ما تتغيرش، والدورة تتمدد.",
    },
  },
  {
    q: "استبدلنا النابض بواحد صلابته 9k. الزمن الدوري...",
    options: ["يبقى التلت", "يتضاعف 9 مرات", "ما يتغيرش لأن الكتلة ثابتة"],
    answer: 0,
    why: {
      weak: "سوستة أقوى بترجّع أسرع، فاللفة تخلّص في وقت أقل.",
      strong: "T ∝ 1/√k و √9 = 3، إذن T' = T/3 و ω' = 3ω.",
      sharp: "على الرسم تظهر 3 موجات في زمن موجة قديمة، بنفس السعة. متردّدش التردد الزاوي مع التردد العادي.",
    },
  },
  {
    q: "السعة بقت 2A والكتلة والصلابة ثابتين. الطاقة الميكانيكية...",
    options: ["تضعف", "تبقى 4 أمثال", "ما تتغيرش زي الزمن الدوري"],
    answer: 1,
    why: {
      weak: "السحبة الضعف مش طاقة ضعف. التربيع يخلّيها أربع مرات.",
      strong: "E = ½kA². A ×2 يعني A² ×4. أما T ما يتغيرش.",
      sharp: "Fmax و amax بس هم اللي يتضاعفوا خطيًا مع A. الخلط بينهم وبين الطاقة هو فخ السؤال اللي بعد كده.",
    },
  },
  {
    q: "ليه نقيس زمن 10 اهتزازات ونقسم؟",
    options: ["عشان السعة تكبر", "عشان نقلل أثر غلطة الساعة", "عشان k تتغير"],
    answer: 1,
    why: {
      weak: "اهتزازة واحدة سريعة، وإيدك على الساعة تتأخر. عشر مرات تخلي الغلطة صغيرة.",
      strong: "T = t/N. الغلطة المطلقة تتوزع على N فتصغّر الخطأ النسبي.",
      sharp: "ده تعريف قياس، مش تصحيح لقانون الزمن. ما تدّعيش إن N غيّرت T الحقيقي.",
    },
  },
  {
    q: "القوة F = −30x. ثابت الصلابة يساوي...",
    options: ["−30", "30", "15"],
    answer: 1,
    why: {
      weak: "السالب بس بيقول الاتجاه. الرقم الموجب هو قساوة السوستة.",
      strong: "قارن بـ F = −kx. معامل x هو k = 30 N/m.",
      sharp: "متدخلش السالب في الجذر. ω و T و k بيتطلعوا موجبين، والإشارة تترجع لما تحسب اتجاه F أو a.",
    },
  },
  {
    q: "في x = 0.50 sin(8π t)، الزمن الدوري...",
    options: ["0.50 s", "8π s", "0.25 s"],
    answer: 2,
    why: {
      weak: "0.50 هي أبعد مسافة، مش الزمن. الزمن يطلع من الرقم اللي جوه.",
      strong: "A = 0.50 m و ω = 8π. T = 2π/ω = 2π/(8π) = 0.25 s.",
      sharp: "الجيب صفر عند t = 0، فالبداية اتزان. لو بدأت من الطرف كانت الصورة جيب تمام أو طور مختلف.",
    },
  },
];

function Quiz({ level }: { level: Level }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const score = useMemo(
    () => QUIZ.reduce((s, q, i) => s + (picks[i] === q.answer ? 1 : 0), 0),
    [picks],
  );
  const done = Object.keys(picks).length === QUIZ.length;
  return (
    <Card id="quiz" title="تدريب سريع">
      <div className="grid gap-4">
        {QUIZ.map((q, i) => {
          const pick = picks[i];
          return (
            <article key={q.q}>
              <h3 className="text-sm font-medium">
                {i + 1}. {q.q}
              </h3>
              <div className="mt-2 grid gap-2">
                {q.options.map((op, j) => {
                  const on = pick === j;
                  const good = pick !== undefined && j === q.answer;
                  const bad = on && j !== q.answer;
                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setPicks((p) => ({ ...p, [i]: j }))}
                      className={`min-h-11 rounded-xl border px-3 text-right text-sm ${
                        good ? "border-teal bg-teal-soft" : bad ? "border-copper bg-copper-soft" : "border-line"
                      }`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
              {pick !== undefined && <p className="mt-2 text-sm text-muted">{q.why[level]}</p>}
            </article>
          );
        })}
      </div>
      {done && (
        <p className="mt-4 rounded-xl bg-teal-soft p-3 text-sm font-medium">
          نتيجتك {score} من {QUIZ.length}. ارجع للمعمل وغيّر الطبقة لو حابب تشوف نفس الإجابة بعمق تاني.
        </p>
      )}
    </Card>
  );
}
