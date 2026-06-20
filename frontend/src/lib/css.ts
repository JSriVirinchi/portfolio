import type { CSSProperties } from 'react';

// Parse an inline CSS string into a React style object so JSX can mirror the
// design's exact inline styling verbatim. Splits declarations on ';' and each
// property on its first ':'. Values here never contain ';' or ':' (no data:
// URLs or nested declarations), so this stays correct without a full parser.
export function s(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i === -1) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    // -webkit-background-clip -> WebkitBackgroundClip; background-clip -> backgroundClip
    const key = prop.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = val;
  }
  return out as CSSProperties;
}
