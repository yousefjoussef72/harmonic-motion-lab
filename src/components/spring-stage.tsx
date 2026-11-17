import { fmt } from "@/lib/physics";

type Props = {
  x: number;
  A: number;
  F: number;
  v: number;
};

export function SpringStage({ x, A, F, v }: Props) {
  const width = 680;
  const height = 230;
  const wall = 56;
  const mid = 360;
  const scale = 1100;
  const massW = 72;
  const massH = 64;
  const massX = mid + x * scale - massW / 2;
  const y = 118;
  const springEnd = Math.max(wall + 28, massX);
  const coils = springPath(wall, springEnd, y, 12);
  const arrowLen = Math.min(90, Math.abs(F) * 1.6);
  const arrowDir = F === 0 ? 0 : Math.sign(F);
  const ax = massX + massW / 2;
  const ay = y - 52;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="نابض أفقي وكتلة">
      <rect x="0" y="0" width={width} height={height} fill="var(--color-surface)" />
      <line x1="24" y1="40" x2="24" y2="190" stroke="var(--color-ink)" strokeWidth="8" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1="8" y1={52 + i * 24} x2="24" y2={68 + i * 24} stroke="var(--color-ink)" strokeWidth="3" />
      ))}
      <line x1={mid} y1="36" x2={mid} y2="196" stroke="var(--color-teal)" strokeDasharray="4 6" strokeWidth="1.5" />
      <text x={mid} y="28" textAnchor="middle" fill="var(--color-teal)" fontSize="13">الاتزان x = 0</text>
      <line x1={mid - A * scale} y1="188" x2={mid + A * scale} y2="188" stroke="var(--color-line)" strokeWidth="3" />
      <line x1={mid - A * scale} y1="180" x2={mid - A * scale} y2="196" stroke="var(--color-copper)" strokeWidth="2" />
      <line x1={mid + A * scale} y1="180" x2={mid + A * scale} y2="196" stroke="var(--color-copper)" strokeWidth="2" />
      <text x={mid + A * scale} y="214" textAnchor="middle" fill="var(--color-copper)" fontSize="12">+A</text>
      <text x={mid - A * scale} y="214" textAnchor="middle" fill="var(--color-copper)" fontSize="12">−A</text>
      <path d={coils} fill="none" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" />
      <rect x={massX} y={y - massH / 2} width={massW} height={massH} rx="8" fill="var(--color-teal)" />
      <text x={ax} y={y + 5} textAnchor="middle" fill="var(--color-surface)" fontSize="14" fontWeight="600">m</text>
      {arrowDir !== 0 && arrowLen > 6 && (
        <g>
          <line x1={ax} y1={ay} x2={ax + arrowDir * arrowLen} y2={ay} stroke="var(--color-copper)" strokeWidth="3" />
          <polygon points={arrowHead(ax + arrowDir * arrowLen, ay, arrowDir)} fill="var(--color-copper)" />
          <text x={ax} y={ay - 10} textAnchor="middle" fill="var(--color-copper)" fontSize="12">F = {fmt(F, 2)} N</text>
        </g>
      )}
      <text x={ax} y="78" textAnchor="middle" fill="var(--color-ink)" fontSize="13">x = {fmt(x * 100, 1)} cm · v = {fmt(v, 2)} m/s</text>
      <text x="40" y="214" fill="var(--color-muted)" fontSize="12">يمين موجب · السهم قوة الاستعادة</text>
      <title>{`الإزاحة الحالية ${fmt(x, 3)} متر`}</title>
    </svg>
  );
}

function arrowHead(x: number, y: number, dir: number) {
  const s = 8;
  if (dir > 0) return `${x},${y} ${x - s},${y - s / 1.6} ${x - s},${y + s / 1.6}`;
  return `${x},${y} ${x + s},${y - s / 1.6} ${x + s},${y + s / 1.6}`;
}

function springPath(x1: number, x2: number, y: number, coils: number) {
  const amp = 18;
  const span = Math.max(20, x2 - x1);
  const step = span / coils;
  let d = `M ${x1} ${y}`;
  for (let i = 0; i < coils; i++) {
    const cx = x1 + step * (i + 0.5);
    const dir = i % 2 === 0 ? -1 : 1;
    d += ` Q ${cx} ${y + dir * amp} ${x1 + step * (i + 1)} ${y}`;
  }
  return d;
}
