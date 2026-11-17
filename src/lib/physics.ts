export type Level = "weak" | "strong" | "sharp";

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "weak", label: "ضعيف", hint: "بلغة بسيطة، من غير اشتقاق" },
  { id: "strong", label: "قوي", hint: "القانون ومعناه في الامتحان" },
  { id: "sharp", label: "خارق", hint: "جاي منين، والفخاخ" },
];

export function omegaOf(k: number, m: number) {
  return Math.sqrt(k / m);
}

export function periodOf(k: number, m: number) {
  return 2 * Math.PI * Math.sqrt(m / k);
}

export function freqOf(k: number, m: number) {
  return 1 / periodOf(k, m);
}

export function stateAt(k: number, m: number, A: number, t: number) {
  const omega = omegaOf(k, m);
  const T = (2 * Math.PI) / omega;
  const phase = ((t % T) + T) % T;
  const x = A * Math.cos(omega * phase);
  const v = -A * omega * Math.sin(omega * phase);
  const a = -omega * omega * x;
  const F = -k * x;
  const Ep = 0.5 * k * x * x;
  const Ek = 0.5 * m * v * v;
  const E = 0.5 * k * A * A;
  return { omega, T, f: 1 / T, phase, x, v, a, F, Ep, Ek, E, vmax: omega * A, amax: omega * omega * A, Fmax: k * A };
}

export function fmt(value: number, digits = 3) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const d = abs >= 100 ? 1 : abs >= 10 ? 2 : digits;
  const rounded = Number(value.toFixed(d));
  if (Object.is(rounded, -0)) return "0";
  return String(rounded);
}

export function phaseName(phase: number, T: number) {
  const u = phase / T;
  if (u < 0.08 || u > 0.92) return "أقصى إزاحة موجبة";
  if (u < 0.17) return "راجع نحو الاتزان";
  if (u < 0.33) return "قرب الاتزان، رايح للسالب";
  if (u < 0.42) return "موضع الاتزان";
  if (u < 0.58) return "أقصى إزاحة سالبة";
  if (u < 0.67) return "راجع نحو الاتزان";
  if (u < 0.83) return "قرب الاتزان، رايح للموجب";
  return "موضع الاتزان";
}
