import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Gauge,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Waves,
} from "lucide-react";
import { SpringStage } from "@/components/spring-stage";
import {
  fmt,
  freqOf,
  omegaOf,
  periodOf,
  stateAt,
  type Level,
} from "@/lib/physics";

type Tab = "lesson" | "laws" | "practice";

const chapters = [
  { id: "idea", title: "يعني إيه حركة توافقية؟", tag: "الفكرة", icon: Lightbulb },
  { id: "hooke", title: "قانون هوك وقوة الإرجاع", tag: "القوة", icon: ArrowLeftRight },
  { id: "period", title: "الزمن الدوري والتردد", tag: "الزمن", icon: Activity },
  { id: "energy", title: "الطاقة في أثناء الحركة", tag: "الطاقة", icon: Gauge },
];

export function LabApp() {
  const [m, setM] = useState(0.2);
  const [k, setK] = useState(80);
  const [A, setA] = useState(8);
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<Tab>("lesson");
  const [level, setLevel] = useState<Level>("weak");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const playRef = useRef(playing);
  playRef.current = playing;

  const T = periodOf(k, m);
  const omega = omegaOf(k, m);
  const sim = stateAt(k, m, A / 100, (angle / (2 * Math.PI)) * T);
  const percent = Math.round((angle / (2 * Math.PI)) * 100);
  const currentPosition = angle < 0.25 * Math.PI || angle > 1.75 * Math.PI
    ? "أقصى إزاحة موجبة"
    : angle < 0.75 * Math.PI
      ? "يتحرك ناحية الاتزان"
      : angle < 1.25 * Math.PI
        ? "أقصى إزاحة سالبة"
        : "راجع ناحية الاتزان";

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      if (playRef.current) setAngle((value) => (value + omega * dt) % (2 * Math.PI));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [omega]);

  const quiz = [
    { q: "أين تكون سرعة الجسم أكبر ما يمكن؟", options: ["عند أقصى إزاحة", "عند موضع الاتزان", "في كل المواضع متساوية"], answer: 1, why: "عند الاتزان تكون طاقة الحركة أكبر ما يمكن، لذلك السرعة عظمى." },
    { q: "إذا زادت الكتلة إلى أربعة أمثالها، فإن الزمن الدوري:", options: ["يتضاعف", "يزيد أربعة أمثال", "يقل للنصف"], answer: 0, why: "T يتناسب مع الجذر التربيعي للكتلة؛ √4 = 2." },
    { q: "إذا تضاعفت السعة، فإن الطاقة الكلية:", options: ["تتضاعف", "تزيد أربعة أمثال", "لا تتغير"], answer: 1, why: "E = ½kA²، لذلك مضاعفة A تجعل الطاقة أربعة أمثال." },
    { q: "عند أقصى إزاحة تكون قوة الإرجاع:", options: ["صفر", "عظمى", "غير موجودة"], answer: 1, why: "مقدار القوة يساوي k|x|، ويبلغ أقصاه عند |x| = A." },
  ];
  const score = quiz.reduce((sum, item, i) => sum + (quizAnswers[i] === item.answer ? 1 : 0), 0);

  return (
    <div className="min-h-screen pb-16">
      <header className="hero-shell relative overflow-hidden">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 sm:pb-14 sm:pt-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-white/75">
              <span className="brand-mark"><Waves size={18} /></span>
              <span>مختبر الفيزياء التفاعلي</span>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/80">الصف الثاني الثانوي</span>
          </div>
          <div className="mt-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/10 px-3 py-1.5 text-xs font-medium text-teal-100">
              <Sparkles size={14} /> افهمها بالتجربة، مش بالحفظ
            </div>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-5xl">
              الحركة التوافقية البسيطة
              <span className="mt-2 block text-teal-200">خلّي الفيزياء تتحرك قدامك.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-8 text-white/70 sm:text-base">
              درس تفاعلي يجمع الشرح المبسّط، والرسوم المتحركة، والمعمل الذي تتحكم فيه بنفسك، ثم يختبر فهمك خطوة بخطوة.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#lab" className="hero-button"><Play size={16} fill="currentColor" /> ابدأ التجربة</a>
            <a href="#course" className="hero-link">اذهب إلى شرح الدرس <ArrowDown size={15} /></a>
          </div>
          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
            <HeroMetric value="01" label="افهم الفكرة" />
            <HeroMetric value="02" label="جرّب بنفسك" />
            <HeroMetric value="03" label="اختبر فهمك" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-7 px-4 py-7 sm:px-6 sm:py-10">
        <section id="lab" className="lab-panel scroll-mt-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="section-kicker"><span className="live-dot" /> تجربة مباشرة</div>
              <h2 className="mt-2 text-2xl font-bold">معمل النابض والكتلة</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted">غيّر الكتلة أو صلابة النابض أو السعة، وشاهد كيف تتغير الحركة والقوة والطاقة لحظيًا.</p>
            </div>
            <div className="flex gap-2">
              <button className="control-primary" onClick={() => setPlaying((v) => !v)} type="button">
                {playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                {playing ? "إيقاف" : "تشغيل"}
              </button>
              <button className="control-quiet" type="button" onClick={() => { setPlaying(false); setAngle(0); }}>
                <RotateCcw size={16} /> إعادة
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="visual-well">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="visual-label"><span className="live-dot" /> المحاكاة الحية</span>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-slate-600">{currentPosition}</span>
              </div>
              <SpringStage x={sim.x} A={A / 100} F={sim.F} v={sim.v} />
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>موضع الجسم خلال الدورة</span>
                <span dir="ltr" className="font-semibold text-teal">{percent}%</span>
              </div>
              <input aria-label="موضع الجسم في الدورة" type="range" min="0" max="1000" value={Math.round(angle / (2 * Math.PI) * 1000)} onChange={(e) => { setPlaying(false); setAngle(Number(e.target.value) / 1000 * 2 * Math.PI); }} className="w-full" dir="ltr" />
            </div>

            <div className="flex flex-col gap-3">
              <Parameter label="كتلة الجسم" symbol="m" value={m} unit="kg" min={0.1} max={2} step={0.05} onChange={(v) => setM(v)} />
              <Parameter label="صلابة النابض" symbol="k" value={k} unit="N/m" min={10} max={200} step={1} onChange={(v) => setK(v)} />
              <Parameter label="سعة الاهتزاز" symbol="A" value={A} unit="cm" min={2} max={12} step={0.5} onChange={(v) => setA(v)} />
              <div className="rounded-2xl bg-teal-950 p-4 text-white">
                <div className="flex items-center gap-2 text-xs text-teal-200"><Lightbulb size={15} /> جرّب ولاحظ</div>
                <p className="mt-2 text-sm leading-7 text-white/85">
                  {m > 1.2 ? "زادت الكتلة؛ لاحظ أن الاهتزاز أصبح أبطأ." : k > 140 ? "النابض أصبح أصلب؛ لاحظ أن الاهتزاز أصبح أسرع." : A > 10 ? "زادت السعة؛ زادت الطاقة، لكن الزمن الدوري لم يتغير." : "ابدأ التشغيل، ثم غيّر قيمة واحدة كل مرة ولاحظ الفرق."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <LiveValue symbol="T" name="الزمن الدوري" value={fmt(sim.T)} unit="s" />
            <LiveValue symbol="f" name="التردد" value={fmt(sim.f)} unit="Hz" />
            <LiveValue symbol="ω" name="التردد الزاوي" value={fmt(sim.omega)} unit="rad/s" />
            <LiveValue symbol="E" name="الطاقة الكلية" value={fmt(sim.E)} unit="J" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <LiveValue symbol="x" name="الإزاحة" value={fmt(sim.x)} unit="m" />
            <LiveValue symbol="v" name="السرعة" value={fmt(sim.v)} unit="m/s" />
            <LiveValue symbol="a" name="العجلة" value={fmt(sim.a)} unit="m/s²" />
            <LiveValue symbol="F" name="قوة الإرجاع" value={fmt(sim.F)} unit="N" />
          </div>
        </section>

        <section id="course" className="scroll-mt-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="section-kicker">رحلة التعلّم</div>
              <h2 className="mt-2 text-2xl font-bold">الدرس من الصفر للاحتراف</h2>
              <p className="mt-2 text-sm leading-7 text-muted">اختر طريقة العرض المناسبة لك، وافتح كل جزء عندما تكون مستعدًا.</p>
            </div>
            <div className="level-switch">
              {([{ id: "weak", label: "ببساطة" }, { id: "strong", label: "للامتحان" }, { id: "sharp", label: "بعمق" }] as const).map((item) => (
                <button key={item.id} type="button" onClick={() => setLevel(item.id)} className={level === item.id ? "active" : ""}>{item.label}</button>
              ))}
            </div>
          </div>

          <div className="tab-strip">
            <button type="button" onClick={() => setTab("lesson")} className={tab === "lesson" ? "selected" : ""}><BookOpen size={16} /> شرح الدرس</button>
            <button type="button" onClick={() => setTab("laws")} className={tab === "laws" ? "selected" : ""}><Waves size={16} /> القوانين والملخص</button>
            <button type="button" onClick={() => setTab("practice")} className={tab === "practice" ? "selected" : ""}><CircleHelp size={16} /> اختبر نفسك</button>
          </div>

          {tab === "lesson" && <div className="mt-4 grid gap-3">
            <LessonCard id="idea" number="01" title="يعني إيه حركة توافقية بسيطة؟" subtitle="الفكرة الأساسية" icon={<Waves size={19} />} defaultOpen>
              <p>تخيّل جسمًا مربوطًا في سوستة. تسحبه قليلًا ثم تتركه؛ يتحرك يمينًا ويسارًا حول نقطة ثابتة اسمها <strong>موضع الاتزان</strong>.</p>
              <Illustration type="motion" />
              <p>نسميها حركة توافقية بسيطة عندما تكون قوة الإرجاع متناسبة طرديًا مع الإزاحة، وفي عكس اتجاهها.</p>
              <Formula>F = −kx</Formula>
              <Explain level={level} simple="كلما أبعدت الجسم عن المنتصف، زادت قوة السوستة التي تشده للمنتصف. وعندما يمر بالمنتصف تكون القوة صفرًا." exam="قوة الإرجاع تتناسب طرديًا مع الإزاحة وتكون في عكس اتجاهها: F = −kx." deep="السالب يعبّر عن الاتجاه لا عن مقدار الثابت. مقدار القوة |F| = k|x|، وk ثابت موجب." />
            </LessonCard>
            <LessonCard id="hooke" number="02" title="قانون هوك: لماذا يعود الجسم؟" subtitle="القوة والإزاحة" icon={<ArrowLeftRight size={19} />}>
              <p>النابض لا يحب أن يظل مشدودًا أو مضغوطًا؛ فيؤثر بقوة تحاول إعادته لطوله الطبيعي. داخل حد المرونة، تزداد القوة بنفس نسبة زيادة الإزاحة.</p>
              <Illustration type="hooke" />
              <Formula>F = −kx　　a = −(k/m)x</Formula>
              <div className="tip-card"><strong>مثال سريع:</strong> إذا كان k = 50 N/m وأزحنا الجسم 0.04 m، فإن مقدار القوة = 50 × 0.04 = 2 N، واتجاهها عكس الإزاحة.</div>
              <Explain level={level} simple="لو سحبت السوستة مسافة أكبر، ستشدك بقوة أكبر. والسالب معناه أنها تشد عكس السحب." exam="k هي صلابة النابض ووحدتها N/m. عند x = 0 تكون F = 0، وعند x = ±A تكون القوة عظمى." deep="بالتعويض في قانون نيوتن F = ma نحصل على a = −(k/m)x، وهي صورة التسارع في الحركة التوافقية." />
            </LessonCard>
            <LessonCard id="period" number="03" title="الزمن الدوري والتردد" subtitle="كم تستغرق الاهتزازة؟" icon={<Activity size={19} />}>
              <p><strong>الزمن الدوري T:</strong> الزمن اللازم لعمل اهتزازة كاملة. <strong>التردد f:</strong> عدد الاهتزازات الكاملة في الثانية.</p>
              <Illustration type="period" />
              <Formula>T = 2π√(m/k)　　f = 1/T　　ω = 2πf</Formula>
              <div className="tip-card">زيادة الكتلة تجعل الاهتزاز أبطأ، وزيادة صلابة النابض تجعله أسرع. السعة لا تؤثر في T في النموذج المثالي.</div>
              <Explain level={level} simple="الجسم الأثقل يحتاج وقتًا أطول ليكمل ذهابًا وعودة. أما السوستة الأقوى فترجعه أسرع." exam="T = 2π√(m/k)، وω = √(k/m)، وf = 1/T. لا تدخل السعة A في قانون الزمن الدوري." deep="من F = ma وF = −kx: a = −(k/m)x. وبالمقارنة مع a = −ω²x نجد ω² = k/m، ثم T = 2π/ω." />
            </LessonCard>
            <LessonCard id="energy" number="04" title="الطاقة: أين تذهب الحركة؟" subtitle="تبادل بين طاقة الوضع والحركة" icon={<Gauge size={19} />}>
              <p>عند أقصى إزاحة تكون السرعة لحظيًا صفرًا والطاقة مخزنة في النابض. وعند الاتزان تتحول إلى طاقة حركة، وتصبح السرعة أكبر ما يمكن.</p>
              <Illustration type="energy" />
              <Formula>Ep = ½kx²　　Ek = ½mv²　　E = ½kA²</Formula>
              <Explain level={level} simple="عند الطرف: الجسم واقف لحظة والسوستة مشدودة. في المنتصف: الجسم أسرع ما يمكن. الطاقة تتبادل بينهما." exam="في غياب الاحتكاك تظل الطاقة الميكانيكية ثابتة: E = Ep + Ek = ½kA²." deep="عند الطرف v = 0 فتكون E = ½kA². عند الاتزان x = 0 فتكون Ek = E، ومنها vmax = ωA." />
            </LessonCard>
          </div>}

          {tab === "laws" && <div className="mt-4 grid gap-3 md:grid-cols-2">
            <LawCard title="قوانين الحركة" formula="x = A cos(ωt)" note="عند بدء الحركة من أقصى إزاحة موجبة." />
            <LawCard title="التسارع" formula="a = −ω²x" note="يتناسب مع الإزاحة وعكس اتجاهها." />
            <LawCard title="قوة الإرجاع" formula="F = −kx" note="قانون هوك داخل حد المرونة." />
            <LawCard title="التردد الزاوي" formula="ω = √(k/m)" note="وحدته راديان لكل ثانية." />
            <LawCard title="الزمن الدوري" formula="T = 2π√(m/k)" note="يزيد مع الكتلة ويقل مع صلابة النابض." />
            <LawCard title="التردد" formula="f = 1/T = ω/2π" note="عدد الاهتزازات في الثانية." />
            <LawCard title="السرعة العظمى" formula="vmax = ωA" note="تحدث عند موضع الاتزان." />
            <LawCard title="الطاقة الكلية" formula="E = ½kA²" note="ثابتة عند إهمال الاحتكاك." />
            <div className="summary-card md:col-span-2">
              <h3 className="font-bold">خريطة الحل في الامتحان</h3>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                <li><b>1</b> استخرج m وk وA مع تحويل الوحدات.</li>
                <li><b>2</b> احسب ω = √(k/m).</li>
                <li><b>3</b> احسب T = 2π/ω أو f = 1/T.</li>
                <li><b>4</b> حدد موضع الجسم لتعرف v وa وF والطاقة.</li>
              </ol>
            </div>
          </div>}

          {tab === "practice" && <div className="mt-4 rounded-3xl border border-line bg-white p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><div className="section-kicker">تأكد من فهمك</div><h3 className="mt-1 text-xl font-bold">اختبار سريع</h3></div>
              <span className="rounded-full bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">{score} / {quiz.length}</span>
            </div>
            <div className="grid gap-5">
              {quiz.map((item, i) => <div key={item.q} className="border-b border-line pb-4">
                <p className="font-semibold">{i + 1}. {item.q}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {item.options.map((option, j) => <button type="button" key={option} onClick={() => setQuizAnswers((old) => ({ ...old, [i]: j }))} className={`quiz-option ${quizAnswers[i] === j ? j === item.answer ? "correct" : "incorrect" : ""}`}>{option}</button>)}
                </div>
                {quizAnswers[i] !== undefined && <p className="mt-2 flex items-start gap-2 text-sm text-muted"><CheckCircle2 size={16} className="mt-1 shrink-0 text-teal" />{item.why}</p>}
              </div>)}
            </div>
            <button type="button" className="control-quiet mt-4" onClick={() => setQuizAnswers({})}><RotateCcw size={15} /> إعادة الاختبار</button>
          </div>}
        </section>

        <section className="rounded-3xl border border-line bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="section-kicker">اربط الشرح بالتجربة</div><h2 className="mt-1 text-xl font-bold">شاهد كيف تتغير الطاقة الآن</h2></div>
            <a href="#lab" className="text-sm font-semibold text-teal">ارجع للمعمل ↑</a>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <EnergyBar label="طاقة الوضع المرونية" value={sim.Ep} total={sim.E} tone="copper" />
              <EnergyBar label="طاقة الحركة" value={sim.Ek} total={sim.E} tone="teal" />
              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-muted">
                <b className="text-ink">لاحظ:</b> حرّك الجسم في المعمل. عند الطرف تقترب طاقة الوضع من 100%، وعند المنتصف تقترب طاقة الحركة من 100%.
              </div>
            </div>
            <EnergyDonut ep={sim.Ep} ek={sim.Ek} />
          </div>
        </section>

        <footer className="py-4 text-center text-xs text-muted">
          صُمّم للتعلّم بالتجربة · معمل الحركة التوافقية البسيطة
        </footer>
      </main>
    </div>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-3 backdrop-blur"><div className="text-xl font-bold text-teal-200">{value}</div><div className="mt-1 text-xs text-white/65">{label}</div></div>;
}

function Parameter({ label, symbol, value, unit, min, max, step, onChange }: { label: string; symbol: string; value: number; unit: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return <label className="parameter-card">
    <span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{label}</span><span className="parameter-symbol">{symbol}</span></span>
    <span className="mt-3 flex items-baseline gap-1" dir="ltr"><b className="text-2xl text-teal">{fmt(value, 2)}</b><small className="text-muted">{unit}</small></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" dir="ltr" />
    <span className="flex justify-between text-[10px] text-muted" dir="ltr"><span>{min}</span><span>{max}</span></span>
  </label>;
}

function LiveValue({ symbol, name, value, unit }: { symbol: string; name: string; value: string; unit: string }) {
  return <div className="metric-tile"><div className="flex items-center justify-between"><span className="text-xs text-muted">{name}</span><b className="metric-symbol">{symbol}</b></div><div className="mt-2 flex items-baseline gap-1" dir="ltr"><strong className="text-xl font-bold">{value}</strong><span className="text-[10px] text-muted">{unit}</span></div></div>;
}

function LessonCard({ id, number, title, subtitle, icon, children, defaultOpen = false }: { id: string; number: string; title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  return <details id={id} className="lesson-card" open={defaultOpen}>
    <summary><span className="chapter-number">{number}</span><span className="chapter-icon">{icon}</span><span className="min-w-0 flex-1"><small>{subtitle}</small><strong>{title}</strong></span><ChevronDown className="chapter-chevron" size={19} /></summary>
    <div className="lesson-content">{children}</div>
  </details>;
}

function Formula({ children }: { children: React.ReactNode }) {
  return <div className="formula-display" dir="ltr">{children}</div>;
}

function Explain({ level, simple, exam, deep }: { level: Level; simple: string; exam: string; deep: string }) {
  return <div className="explain-card"><div className="flex items-center gap-2 text-xs font-bold text-teal"><Lightbulb size={15} /> {level === "weak" ? "ببساطة" : level === "strong" ? "ركز في الامتحان" : "فهم أعمق"}</div><p className="mt-2 text-sm leading-7">{level === "weak" ? simple : level === "strong" ? exam : deep}</p></div>;
}

function LawCard({ title, formula, note }: { title: string; formula: string; note: string }) {
  return <div className="law-card"><small>{title}</small><strong dir="ltr">{formula}</strong><p>{note}</p></div>;
}

function EnergyBar({ label, value, total, tone }: { label: string; value: number; total: number; tone: "teal" | "copper" }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, value / total * 100)) : 0;
  return <div><div className="mb-2 flex justify-between text-sm"><b>{label}</b><span dir="ltr">{fmt(pct, 1)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone === "teal" ? "bg-teal" : "bg-orange-400"}`} style={{ width: `${pct}%` }} /></div></div>;
}

function EnergyDonut({ ep, ek }: { ep: number; ek: number }) {
  const total = Math.max(ep + ek, 0.000001);
  const p = ep / total;
  return <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-5">
    <svg viewBox="0 0 220 170" className="w-full max-w-xs" role="img" aria-label="مخطط يوضح نسبة طاقة الوضع والحركة">
      <circle cx="110" cy="78" r="54" fill="none" stroke="#e2e8f0" strokeWidth="18" />
      <circle cx="110" cy="78" r="54" fill="none" stroke="#0e8178" strokeWidth="18" strokeDasharray={`${(1 - p) * 339} 339`} transform="rotate(-90 110 78)" strokeLinecap="round" />
      <circle cx="110" cy="78" r="54" fill="none" stroke="#fb923c" strokeWidth="18" strokeDasharray={`${p * 339} 339`} strokeDashoffset={`${-(1 - p) * 339}`} transform="rotate(-90 110 78)" strokeLinecap="round" />
      <text x="110" y="73" textAnchor="middle" fill="#0f172a" fontSize="19" fontWeight="700">{fmt(total, 2)}</text>
      <text x="110" y="92" textAnchor="middle" fill="#64748b" fontSize="10">جول</text>
      <text x="110" y="155" textAnchor="middle" fill="#64748b" fontSize="10">تقسيم الطاقة في اللحظة الحالية</text>
    </svg>
    <div className="flex flex-wrap justify-center gap-4 text-xs"><span className="flex items-center gap-2"><i className="legend-dot bg-orange-400" /> طاقة الوضع</span><span className="flex items-center gap-2"><i className="legend-dot bg-teal" /> طاقة الحركة</span></div>
  </div>;
}

function Illustration({ type }: { type: "motion" | "hooke" | "period" | "energy" }) {
  if (type === "motion") return <div className="diagram-card"><svg viewBox="0 0 640 150" className="w-full" role="img" aria-label="مواضع الجسم الثلاثة في الاهتزاز"><line x1="90" y1="95" x2="550" y2="95" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 7" /><line x1="320" y1="22" x2="320" y2="112" stroke="#0e8178" strokeDasharray="4 5" strokeWidth="2" /><g fill="#0e8178"><circle cx="120" cy="95" r="17" /><circle cx="320" cy="95" r="17" /><circle cx="520" cy="95" r="17" /></g><g fill="#334155" fontSize="15" textAnchor="middle"><text x="120" y="132">−A</text><text x="320" y="132">الاتزان</text><text x="520" y="132">+A</text></g><path d="M150 58 H285 M355 58 H490" stroke="#f97316" strokeWidth="3" strokeLinecap="round" /><path d="m278 51 8 7-8 7 M483 51 491 58 483 65" stroke="#f97316" fill="none" strokeWidth="3" strokeLinecap="round" /></svg><p className="text-center text-xs text-muted">الجسم يتحرك ذهابًا وإيابًا حول موضع الاتزان.</p></div>;
  if (type === "hooke") return <div className="diagram-card"><svg viewBox="0 0 640 190" className="w-full" role="img" aria-label="رسم بياني خطي لقانون هوك"><line x1="70" y1="95" x2="575" y2="95" stroke="#94a3b8" strokeWidth="2" /><line x1="320" y1="18" x2="320" y2="168" stroke="#94a3b8" strokeWidth="2" /><path d="M120 25 520 165" stroke="#0e8178" strokeWidth="4" strokeLinecap="round" /><circle cx="320" cy="95" r="5" fill="#f97316" /><g fill="#64748b" fontSize="13"><text x="575" y="115">x</text><text x="334" y="25">F</text><text x="326" y="113">0</text></g><text x="100" y="20" fill="#0e8178" fontSize="14">F = −kx</text></svg><p className="text-center text-xs text-muted">كلما زادت الإزاحة، زاد مقدار القوة في الاتجاه العكسي.</p></div>;
  if (type === "period") return <div className="diagram-card"><svg viewBox="0 0 640 190" className="w-full" role="img" aria-label="منحنى جيبي يوضح دورة كاملة"><line x1="38" y1="95" x2="610" y2="95" stroke="#cbd5e1" strokeWidth="2" /><path d={Array.from({ length: 101 }, (_, i) => `${i ? "L" : "M"} ${40 + i * 5.6} ${95 - 60 * Math.cos(i / 100 * 2 * Math.PI)}`).join(" ")} fill="none" stroke="#0e8178" strokeWidth="4" strokeLinecap="round" /><g stroke="#f97316" strokeWidth="2"><line x1="40" y1="24" x2="40" y2="166" strokeDasharray="4 4" /><line x1="600" y1="24" x2="600" y2="166" strokeDasharray="4 4" /><path d="M40 151 V160 H600 V151" fill="none" /></g><text x="320" y="180" fill="#c2410c" textAnchor="middle" fontSize="14">زمن دورة كاملة = T</text></svg><p className="text-center text-xs text-muted">من قمة إلى القمة التالية: اهتزازة كاملة.</p></div>;
  return <div className="diagram-card"><svg viewBox="0 0 640 160" className="w-full" role="img" aria-label="تبادل الطاقة بين الوضع والحركة"><rect x="30" y="20" width="580" height="22" rx="11" fill="#ffedd5" /><rect x="30" y="20" width="580" height="22" rx="11" fill="#fb923c" /><rect x="30" y="78" width="580" height="22" rx="11" fill="#ccfbf1" /><rect x="30" y="78" width="290" height="22" rx="11" fill="#0e8178" /><g fill="#475569" fontSize="13"><text x="30" y="14">عند الطرف: طاقة وضع أكبر</text><text x="30" y="72">في المنتصف: طاقة حركة أكبر</text><text x="320" y="132" textAnchor="middle">مجموع الطاقة ثابت في الحالتين</text></g></svg><p className="text-center text-xs text-muted">الطاقة تنتقل بين الوضع والحركة ولا تختفي.</p></div>;
}
