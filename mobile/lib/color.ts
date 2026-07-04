/** Parse a #rrggbb (or #rgb) hex string into [r,g,b] (0–255). */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const int = parseInt(h, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export type ColorStop = { pos: number; color: string };

/**
 * Interpolate a color from an ordered list of stops at fraction t (0–1).
 * Used to approximate a conic gradient by sampling many angular segments.
 */
export function sampleGradient(stops: ColorStop[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (clamped >= a.pos && clamped <= b.pos) {
      const span = b.pos - a.pos || 1;
      const local = (clamped - a.pos) / span;
      const [ar, ag, ab] = hexToRgb(a.color);
      const [br, bg, bb] = hexToRgb(b.color);
      return rgbToHex(
        ar + (br - ar) * local,
        ag + (bg - ag) * local,
        ab + (bb - ab) * local
      );
    }
  }
  return stops[stops.length - 1].color;
}
