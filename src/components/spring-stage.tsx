import { fmt } from "@/lib/physics";

type Props = { x: number; A: number; F: number; v: number };

export function SpringStage({ x, A, F, v }: Props) {
  const width = 720;
  const height = 300;
  const wall = 58;
  const mid = 370;
  const scale = 1050;
  const massW = 78;
  const massH = 68;
  const massX = Math.max(130, Math.min(590, mid + x * scale - massW / 2));
  const y = 150;
  const springEnd = massX;
  const coils = springPath(wall, springEnd, y, 15);
  const forceLen = Math.min(100, Math.abs(F) * 1.8);
  const direction = F === 0 ? 0 : Math.sign(F);
  const centerX = massX + massW / 2;
  const forceY = y - 58;
  const displacementY = 238;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="رسم متحرك لنابض وكتلة تتحرك حول موضع الاتزان">
      <defs>
        <linearGradient id="massGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#31b9a6" />
          <stop offset="100%" stopColor="#08766f" />
        </linearGradient>
        <linearGradient id="springGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#647d84" />
          <stop offset="50%" stopColor="#b0c4c5" />
          <stop offset="100%" stopColor="#526c75" />
        </linearGradient>
        <filter id="massShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0d343a" floodOpacity=".18" />
        </filter>
      </defs>
      <rect width={width} height={height} rx="18" fill="#f4f9f8" />
      <g opacity=".35" stroke="#d7e5e4" strokeWidth="1">
        {Array.from({length: 13}, (_,i) => <line key={i} x1={30+i*55} y1="20" x2={30+i*55} y2="270" />)}
      </g>
      <rect x="27" y="63" width="27" height="174" rx="5" fill="#9aadb0" />
      <path d="M29 72h23 M29 93h23 M29 114h23 M29 135h23 M29 156h23 M29 177h23 M29 198h23 M29 219h23" stroke="#eaf1f0" strokeWidth="4" />
      <line x1={mid} y1="40" x2={mid} y2="220" stroke="#0e8178" strokeWidth="2" strokeDasharray="5 7" opacity=".75" />
      <rect x={mid-58} y="31" width="116" height="24" rx="12" fill="#dff4ef" />
      <text x={mid} y="47" textAnchor="middle" fill="#08766f" fontSize="12" fontWeight="700">موضع الاتزان</text>
      <path d={coils} fill="none" stroke="url(#springGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={massX+8} y1={y+massH/2+5} x2={massX+massW-8} y2={y+massH/2+5} stroke="#8aa6a5" strokeWidth="3" strokeLinecap="round" />
      <rect x={massX} y={y-massH/2} width={massW} height={massH} rx="14" fill="url(#massGradient)" filter="url(#massShadow)" />
      <rect x={massX+9} y={y-massH/2+8} width={massW-18} height="7" rx="3.5" fill="#b7fff0" opacity=".35" />
      <text x={centerX} y={y+6} textAnchor="middle" fill="white" fontSize="20" fontWeight="700">m</text>
      {direction !== 0 && forceLen > 4 && <g>
        <line x1={centerX} y1={forceY} x2={centerX+direction*forceLen} y2={forceY} stroke="#e77942" strokeWidth="4" strokeLinecap="round" />
        <path d={direction>0 ? `M${centerX+direction*forceLen} ${forceY} l-12 -7 v14 z` : `M${centerX+direction*forceLen} ${forceY} l12 -7 v14 z`} fill="#e77942" />
        <text x={centerX} y={forceY-13} textAnchor="middle" fill="#b85c31" fontSize="13" fontWeight="700">F = {fmt(F,2)} N</text>
      </g>}
      <text x={centerX} y={y+massH/2+28} textAnchor="middle" fill="#46616a" fontSize="12">x = {fmt(x*100,1)} cm</text>
      <line x1={mid-A*scale} y1={displacementY} x2={mid+A*scale} y2={displacementY} stroke="#aabfc0" strokeWidth="3" strokeLinecap="round" />
      <line x1={mid-A*scale} y1={displacementY-7} x2={mid-A*scale} y2={displacementY+7} stroke="#e77942" strokeWidth="3" />
      <line x1={mid+A*scale} y1={displacementY-7} x2={mid+A*scale} y2={displacementY+7} stroke="#e77942" strokeWidth="3" />
      <circle cx={mid+x*scale} cy={displacementY} r="8" fill="#0e8178" stroke="white" strokeWidth="3" />
      <text x={mid-A*scale} y="262" textAnchor="middle" fill="#bd6339" fontSize="12">−A</text>
      <text x={mid} y="262" textAnchor="middle" fill="#0e8178" fontSize="12">0</text>
      <text x={mid+A*scale} y="262" textAnchor="middle" fill="#bd6339" fontSize="12">+A</text>
      <text x="68" y="287" fill="#6c858a" fontSize="11">يمين موجب</text>
      <text x="650" y="287" textAnchor="end" fill="#6c858a" fontSize="11">v = {fmt(v,2)} m/s</text>
    </svg>
  );
}

function springPath(x1: number, x2: number, y: number, coils: number) {
  const span = Math.max(35, x2 - x1);
  const step = span / coils;
  const amp = 17;
  let d = `M ${x1} ${y}`;
  for (let i = 0; i < coils; i++) {
    const cx = x1 + step * (i + .5);
    const dir = i % 2 === 0 ? -1 : 1;
    d += ` Q ${cx} ${y+dir*amp} ${x1+step*(i+1)} ${y}`;
  }
  return d;
}
