import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { fmt } from "@/lib/physics";

type SpringProps = { x: number; A: number; F: number; v: number };
type PendulumProps = { theta: number; length: number; mass: number };

function useThreeStage(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setup: (scene: THREE.Scene) => void,
  update: (scene: THREE.Scene, dt: number) => void,
) {
  const setupRef = useRef(setup);
  const updateRef = useRef(update);
  updateRef.current = update;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#071522");
    scene.fog = new THREE.Fog("#071522", 8, 19);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    scene.add(new THREE.HemisphereLight("#d8f2ff", "#172432", 1.65));
    const key = new THREE.DirectionalLight("#fff1d6", 3.2);
    key.position.set(3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.PointLight("#35b8ff", 18, 10);
    rim.position.set(-3, 3, -3);
    scene.add(rim);
    camera.position.set(4.2, 3.15, 6.8);
    camera.lookAt(0, 1.15, 0);
    setupRef.current(scene);
    const resize = () => {
      const width = Math.max(canvas.clientWidth, 280);
      const height = Math.max(canvas.clientHeight, 190);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);
    resize();
    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.04);
      updateRef.current(scene, dt);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
        else mesh.material?.dispose?.();
      });
      renderer.dispose();
    };
  }, []);
}

function addFloor(scene: THREE.Scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    new THREE.MeshStandardMaterial({ color: "#101f31", roughness: 0.82, metalness: 0.15 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.04;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(18, 36, "#24607a", "#18364d");
  grid.position.y = -0.025;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.34;
  scene.add(grid);
}

function metal(color = "#9bb7c9", roughness = 0.24) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.82, roughness });
}

function makeSpringGeometry(startX: number, endX: number) {
  const points: THREE.Vector3[] = [];
  const turns = 13;
  const count = 220;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const a = t * turns * Math.PI * 2;
    points.push(new THREE.Vector3(startX + (endX - startX) * t, 1.08 + Math.cos(a) * 0.115, Math.sin(a) * 0.115));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 200, 0.026, 8, false);
}

export function SpringScene({ x, A, F, v }: SpringProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ x, A, F, v });
  const lastX = useRef(Number.NaN);
  live.current = { x, A, F, v };
  const setup = (scene: THREE.Scene) => {
    addFloor(scene);
    const dark = new THREE.MeshStandardMaterial({ color: "#172b3c", metalness: 0.7, roughness: 0.32 });
    const steel = metal("#9eb6c7", 0.22);
    const blue = new THREE.MeshStandardMaterial({ color: "#087fc4", metalness: 0.58, roughness: 0.23 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.2, 1.45), dark);
    wall.position.set(-2.15, 1.05, 0);
    wall.castShadow = true;
    scene.add(wall);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.08, 0.58), steel);
    rail.position.set(0.05, 0.12, 0);
    rail.castShadow = true;
    scene.add(rail);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 1.05), dark);
    foot.position.set(0.05, 0.03, 0);
    foot.castShadow = true;
    scene.add(foot);
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.58, 0.72), blue);
    block.name = "spring-block";
    block.position.set(0.95, 1.08, 0);
    block.castShadow = true;
    block.receiveShadow = true;
    scene.add(block);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.035, 0.59), new THREE.MeshStandardMaterial({ color: "#72d7ff", metalness: 0.48, roughness: 0.2 }));
    cap.position.y = 0.3;
    block.add(cap);
    const spring = new THREE.Mesh(makeSpringGeometry(-2.02, 0.56), metal("#c9d7e1", 0.17));
    spring.name = "spring-coil";
    scene.add(spring);
    const force = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 1.62, 0), 0.55, 0xffa04d, 0.18, 0.12);
    force.name = "spring-force";
    scene.add(force);
    const lamp = new THREE.PointLight("#159bd8", 7, 5);
    lamp.position.set(0.8, 2.5, 1.2);
    scene.add(lamp);
  };
  const update = (scene: THREE.Scene) => {
    const p = live.current;
    const normalized = p.A > 0 ? Math.max(-1, Math.min(1, p.x / p.A)) : 0;
    const blockX = 0.95 + normalized * 0.95;
    const block = scene.getObjectByName("spring-block") as THREE.Mesh | undefined;
    const spring = scene.getObjectByName("spring-coil") as THREE.Mesh | undefined;
    const force = scene.getObjectByName("spring-force") as THREE.ArrowHelper | undefined;
    if (block) block.position.x = blockX;
    if (spring && Math.abs(p.x - lastX.current) > 0.0008) {
      spring.geometry.dispose();
      spring.geometry = makeSpringGeometry(-2.02, blockX - 0.39);
      lastX.current = p.x;
    }
    if (force) {
      force.position.set(blockX, 1.62, 0);
      force.setDirection(new THREE.Vector3(p.F >= 0 ? 1 : -1, 0, 0));
      force.setLength(0.25 + Math.min(Math.abs(p.F) / 60, 0.85), 0.17, 0.12);
      force.visible = Math.abs(p.F) > 0.02;
    }
  };
  useThreeStage(canvas, setup, update);
  return (
    <div className="realistic-stage spring-realistic">
      <canvas ref={canvas} aria-label={`محاكاة ثلاثية الأبعاد لنابض وكتلة؛ الإزاحة ${fmt(x)} متر والسرعة ${fmt(v)} متر لكل ثانية`} />
      <div className="stage-hud"><span>3D · نابض وكتلة</span><span>F = {fmt(F, 2)} N</span></div>
      <div className="stage-caption">زنبرك معدني وكتلة ثلاثية الأبعاد تتحرك لحظيًا وفق قيم التجربة</div>
    </div>
  );
}

export function PendulumScene({ theta, length, mass }: PendulumProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ theta, length, mass });
  live.current = { theta, length, mass };
  const setup = (scene: THREE.Scene) => {
    addFloor(scene);
    const frameMat = metal("#a9c0d0", 0.27);
    const frame = new THREE.Group();
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.15, 0.14), frameMat);
    post.position.set(0, 1.55, 0);
    post.castShadow = true;
    frame.add(post);
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 0.2), frameMat);
    top.position.set(0, 3.05, 0);
    top.castShadow = true;
    frame.add(top);
    for (const z of [-0.68, 0.68]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.7), frameMat);
      foot.position.set(0, 0.08, z);
      frame.add(foot);
    }
    scene.add(frame);
    const pivot = new THREE.Group();
    pivot.name = "pendulum-pivot";
    pivot.position.set(0, 2.94, 0);
    scene.add(pivot);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 18), metal("#e6edf2", 0.16));
    pivot.add(pin);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 12), metal("#c8d7df", 0.18));
    rod.name = "pendulum-rod";
    rod.position.y = -0.5;
    pivot.add(rod);
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.15, 40, 32), new THREE.MeshStandardMaterial({ color: "#e5a83c", metalness: 0.78, roughness: 0.19 }));
    bob.name = "pendulum-bob";
    bob.position.y = -1;
    bob.castShadow = true;
    pivot.add(bob);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.018, 10, 40), metal("#fff0bf", 0.15));
    band.name = "pendulum-band";
    band.position.y = -1;
    pivot.add(band);
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.7, 0.05), new THREE.MeshStandardMaterial({ color: "#32b8d4", emissive: "#07384c", metalness: 0.35, roughness: 0.38 }));
    ruler.position.set(0.55, 1.55, 0);
    scene.add(ruler);
    const glow = new THREE.PointLight("#ffba53", 8, 4);
    glow.position.set(0, 1.9, 1.2);
    scene.add(glow);
  };
  const update = (scene: THREE.Scene) => {
    const p = live.current;
    const pivot = scene.getObjectByName("pendulum-pivot") as THREE.Group | undefined;
    if (!pivot) return;
    const scale = Math.min(1.45, Math.max(0.55, p.length / 0.9));
    pivot.rotation.z = p.theta;
    pivot.scale.y = scale;
    const bob = scene.getObjectByName("pendulum-bob") as THREE.Mesh | undefined;
    const band = scene.getObjectByName("pendulum-band") as THREE.Mesh | undefined;
    if (bob) bob.scale.setScalar(0.82 + Math.min(p.mass, 1.5) * 0.23);
    if (band) band.scale.setScalar(0.82 + Math.min(p.mass, 1.5) * 0.23);
  };
  useThreeStage(canvas, setup, update);
  return (
    <div className="realistic-stage pendulum-realistic">
      <canvas ref={canvas} aria-label={`محاكاة ثلاثية الأبعاد لبندول طوله ${fmt(length)} متر وزاويته ${fmt(theta * 180 / Math.PI, 1)} درجة`} />
      <div className="stage-hud"><span>3D · البندول البسيط</span><span>θ = {fmt(theta * 180 / Math.PI, 1)}°</span></div>
      <div className="stage-caption">خيط معدني وكتلة كروية واقعية تتأرجح حول موضع الاتزان</div>
    </div>
  );
}

function Parameter({ label, symbol, value, min, max, step, unit, onChange }: {
  label: string; symbol: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <label className="parameter-card">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span className="flex items-center gap-2"><span className="parameter-symbol">{symbol}</span>{label}</span>
        <span dir="ltr" className="text-teal">{fmt(value, 2)} {unit}</span>
      </span>
      <input className="mt-2 w-full" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} dir="ltr" />
    </label>
  );
}

function PendulumExperiment() {
  const [length, setLength] = useState(0.9);
  const [mass, setMass] = useState(0.5);
  const [maxAngle, setMaxAngle] = useState(12);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(playing);
  playRef.current = playing;
  const omega = Math.sqrt(9.81 / length);
  const period = 2 * Math.PI / omega;
  const thetaMax = maxAngle * Math.PI / 180;
  const theta = thetaMax * Math.cos(phase);
  const velocity = -length * thetaMax * omega * Math.sin(phase);
  const energy = mass * 9.81 * length * (1 - Math.cos(thetaMax));
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      if (playRef.current) setPhase((p) => (p + omega * dt) % (2 * Math.PI));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [omega]);
  return (
    <section id="pendulum" className="lab-panel scroll-mt-5">
      <div className="section-kicker"><span className="live-dot" /> التجربة الثانية</div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-2xl font-bold">معمل البندول البسيط</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">تجربة مستقلة عن النابض: علّق كرة بخيط خفيف، أزحها بزاوية صغيرة واتركها تتأرجح. غيّر طول الخيط والكتلة وزاوية البداية وشاهد تأثير كل عامل.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="control-primary" onClick={() => setPlaying((v) => !v)}>{playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}{playing ? "إيقاف" : "تشغيل"}</button>
          <button type="button" className="control-quiet" onClick={() => { setPlaying(false); setPhase(0); }}><RotateCcw size={16} /> إعادة</button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="visual-well">
          <div className="mb-3 flex items-center justify-between gap-2"><span className="visual-label"><span className="live-dot" /> المحاكاة الحية</span><span className="rounded-full bg-white/70 px-3 py-1 text-xs text-slate-600">{Math.abs(theta) < 0.015 ? "يمر بموضع الاتزان" : theta > 0 ? "يمين الاتزان" : "يسار الاتزان"}</span></div>
          <PendulumScene theta={theta} length={length} mass={mass} />
          <div className="mt-3 flex items-center justify-between text-xs text-muted"><span>طور الاهتزاز</span><span dir="ltr" className="font-semibold text-teal">{fmt(phase / (2 * Math.PI) * 100, 0)}%</span></div>
          <input aria-label="طور البندول" type="range" min="0" max="1000" value={Math.round(phase / (2 * Math.PI) * 1000)} onChange={(e) => { setPlaying(false); setPhase(Number(e.target.value) / 1000 * 2 * Math.PI); }} className="w-full" dir="ltr" />
        </div>
        <div className="flex flex-col gap-3">
          <Parameter label="طول الخيط" symbol="L" value={length} unit="m" min={0.35} max={1.4} step={0.05} onChange={setLength} />
          <Parameter label="كتلة الكرة" symbol="m" value={mass} unit="kg" min={0.1} max={1.5} step={0.05} onChange={setMass} />
          <Parameter label="زاوية الإزاحة الابتدائية" symbol="θ₀" value={maxAngle} unit="°" min={3} max={20} step={1} onChange={setMaxAngle} />
          <div className="rounded-2xl bg-teal-950 p-4 text-white"><div className="flex items-center gap-2 text-xs text-teal-200"><Lightbulb size={15} /> جرّب ولاحظ</div>
            <p className="mt-2 text-sm leading-7 text-white/85">{length > 1.1 ? "زودت طول الخيط؛ البندول بقى أبطأ وزمنه الدوري زاد." : mass > 1.1 ? "غيّرت الكتلة فقط؛ الزمن الدوري لم يتغير، لأن كتلة البندول لا تدخل في القانون." : maxAngle > 15 ? "الزاوية كبيرة نسبيًا؛ قانون الزمن الدوري هنا تقريب صالح للزوايا الصغيرة." : "غيّر الطول أولًا، ثم الكتلة، ولاحظ أيهما يغيّر زمن الذبذبة."}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <LiveValue symbol="T" name="الزمن الدوري" value={fmt(period)} unit="s" />
        <LiveValue symbol="f" name="التردد" value={fmt(1 / period)} unit="Hz" />
        <LiveValue symbol="ω" name="التردد الزاوي" value={fmt(omega)} unit="rad/s" />
        <LiveValue symbol="E" name="الطاقة الميكانيكية" value={fmt(energy)} unit="J" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <LiveValue symbol="θ" name="الإزاحة الزاوية" value={fmt(theta * 180 / Math.PI, 2)} unit="°" />
        <LiveValue symbol="v" name="السرعة المماسية" value={fmt(velocity)} unit="m/s" />
        <LiveValue symbol="L" name="طول الخيط" value={fmt(length)} unit="m" />
        <LiveValue symbol="m" name="كتلة الكرة" value={fmt(mass)} unit="kg" />
      </div>
      <div className="mt-4 rounded-2xl border border-line bg-slate-50 p-4">
        <div className="text-sm font-bold">قانون البندول البسيط (للزوايا الصغيرة)</div>
        <div className="mt-2 overflow-x-auto text-center text-lg font-bold text-teal" dir="ltr">T = 2π√(L/g)　 ·　 ω = √(g/L)</div>
        <p className="mt-2 text-sm leading-7 text-muted">g = 9.81 m/s². لاحظ أن الكتلة لا تظهر في القانون؛ لذلك تغيير كتلة الكرة وحده لا يغيّر الزمن الدوري. زيادة طول الخيط تزيد الزمن الدوري.</p>
      </div>
    </section>
  );
}
