/**
 * Self-hosted SVG cards for the profile README.
 *
 * The usual third-party card services (github-readme-stats,
 * github-readme-activity-graph) are frequently rate-limited or over quota
 * (503 / 402), and none of them can see private contributions. These are
 * rendered here from the same GraphQL data and committed to the repo, so the
 * README only ever loads assets we own.
 */

export const PALETTES = {
  dark: {
    bg: '#0D1117',
    border: '#21262D',
    text: '#C9D1D9',
    muted: '#8B949E',
    accent: '#39D353',
    empty: '#161B22',
    scale: ['#0E4429', '#006D32', '#26A641', '#39D353'],
  },
  light: {
    bg: '#FFFFFF',
    border: '#D0D7DE',
    text: '#1F2328',
    muted: '#59636E',
    accent: '#1A7F37',
    empty: '#EBEDF0',
    scale: ['#ACEEBB', '#4AC26B', '#2DA44E', '#116329'],
  },
};

const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = (n) => n.toLocaleString('en-US');

/** Quantile thresholds so a single 175-commit outlier doesn't flatten the map. */
function thresholds(counts) {
  const nz = counts.filter((n) => n > 0).sort((a, b) => a - b);
  if (!nz.length) return [1, 2, 3];
  const q = (p) => nz[Math.min(nz.length - 1, Math.floor(nz.length * p))];
  return [q(0.35), q(0.65), q(0.88)];
}

/**
 * GitHub-style contribution heatmap for the trailing `weeks` weeks.
 * @param {Map<string, number>} days date (YYYY-MM-DD) -> count
 */
export function heatmap(days, { weeks = 53, total, palette }) {
  const p = PALETTES[palette];
  const CELL = 11;
  const GAP = 3;
  const STEP = CELL + GAP;
  const padX = 22;
  const padTop = 54;
  const labelW = 26;

  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay())); // extend to Saturday
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (weeks * 7 - 1));

  const iso = (d) => d.toISOString().slice(0, 10);
  const todayIso = iso(new Date());
  const counts = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    counts.push(days.get(iso(d)) ?? 0);
  }
  const [t1, t2, t3] = thresholds(counts);
  const level = (n) => (n === 0 ? -1 : n <= t1 ? 0 : n <= t2 ? 1 : n <= t3 ? 2 : 3);

  const gridW = weeks * STEP - GAP;
  const w = padX * 2 + labelW + gridW;
  const h = padTop + 7 * STEP - GAP + 46;

  const cells = [];
  const monthLabels = [];
  let lastMonth = -1;

  for (let wi = 0; wi < weeks; wi++) {
    for (let di = 0; di < 7; di++) {
      const idx = wi * 7 + di;
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + idx);
      const date = iso(d);
      if (date > todayIso) continue;
      const n = counts[idx];
      const lv = level(n);
      const x = padX + labelW + wi * STEP;
      const y = padTop + di * STEP;
      const fill = lv === -1 ? p.empty : p.scale[lv];
      cells.push(
        `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}"><title>${date}: ${num(n)}</title></rect>`,
      );
      if (di === 0) {
        const m = d.getUTCMonth();
        if (m !== lastMonth && wi < weeks - 1) {
          monthLabels.push(
            `<text x="${x}" y="${padTop - 9}" fill="${p.muted}" font-size="10">${
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m]
            }</text>`,
          );
          lastMonth = m;
        }
      }
    }
  }

  const dayLabels = [1, 3, 5]
    .map(
      (di) =>
        `<text x="${padX}" y="${padTop + di * STEP + 9}" fill="${p.muted}" font-size="9">${
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][di]
        }</text>`,
    )
    .join('');

  const legendX = w - padX - 4 - 4 * STEP - 62;
  const legend = [
    `<text x="${legendX}" y="${h - 16}" fill="${p.muted}" font-size="10">Less</text>`,
    ...[-1, 0, 1, 2, 3].map(
      (lv, i) =>
        `<rect x="${legendX + 30 + i * STEP}" y="${h - 25}" width="${CELL}" height="${CELL}" rx="2" fill="${
          lv === -1 ? p.empty : p.scale[lv]
        }" />`,
    ),
    `<text x="${legendX + 30 + 5 * STEP + 2}" y="${h - 16}" fill="${p.muted}" font-size="10">More</text>`,
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${MONO}">
  <rect width="${w}" height="${h}" rx="8" fill="${p.bg}" stroke="${p.border}" />
  <text x="${padX}" y="26" fill="${p.accent}" font-size="13" font-weight="600">$ contributions --last-year</text>
  <text x="${w - padX}" y="26" fill="${p.text}" font-size="13" font-weight="600" text-anchor="end">${num(total)}</text>
  ${monthLabels.join('')}
  ${dayLabels}
  ${cells.join('')}
  ${legend}
</svg>`;
}

/** Stacked language bar + legend. */
export function languages(list, { palette, title = '$ languages --public-repos' }) {
  const p = PALETTES[palette];
  const w = 560;
  const padX = 22;
  const barY = 52;
  const barW = w - padX * 2;
  const barH = 12;
  const cols = 2;
  const rows = Math.ceil(list.length / cols);
  const h = barY + barH + 26 + rows * 22 + 12;
  const total = list.reduce((a, l) => a + l.size, 0) || 1;

  let x = padX;
  const segments = list.map((l, i) => {
    const segW = Math.max(2, (l.size / total) * barW);
    const seg = `<rect x="${x.toFixed(2)}" y="${barY}" width="${segW.toFixed(2)}" height="${barH}" fill="${
      l.color || p.muted
    }"><title>${esc(l.name)} ${((l.size / total) * 100).toFixed(1)}%</title></rect>`;
    x += segW;
    return seg;
  });

  const legend = list
    .map((l, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const lx = padX + col * (barW / cols);
      const ly = barY + barH + 32 + row * 22;
      return `<circle cx="${lx + 5}" cy="${ly - 4}" r="5" fill="${l.color || p.muted}" />
  <text x="${lx + 17}" y="${ly}" fill="${p.text}" font-size="12">${esc(l.name)}</text>
  <text x="${lx + barW / cols - 14}" y="${ly}" fill="${p.muted}" font-size="12" text-anchor="end">${(
        (l.size / total) *
        100
      ).toFixed(1)}%</text>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${MONO}">
  <rect width="${w}" height="${h}" rx="8" fill="${p.bg}" stroke="${p.border}" />
  <text x="${padX}" y="30" fill="${p.accent}" font-size="13" font-weight="600">${esc(title)}</text>
  <clipPath id="bar"><rect x="${padX}" y="${barY}" width="${barW}" height="${barH}" rx="6" /></clipPath>
  <g clip-path="url(#bar)">${segments.join('')}</g>
  ${legend}
</svg>`;
}

/** Terminal-window style hero header. */
export function header(
  { name, handle, role, company, location, since, metrics },
  { palette },
) {
  const p = PALETTES[palette];
  const w = 880;
  const h = 230;
  const barH = 36;
  const padX = 28;
  const dots = ['#FF5F56', '#FFBD2E', '#27C93F'];

  const rows = metrics
    .map(
      (m, i) => `<text x="${w - padX}" y="${112 + i * 26}" fill="${p.text}" font-size="15" font-weight="600" text-anchor="end">${esc(
        m.value,
      )}</text>
  <text x="${w - padX - 96}" y="${112 + i * 26}" fill="${p.muted}" font-size="12" text-anchor="end">${esc(m.label)}</text>`,
    )
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${MONO}">
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.accent}" />
      <stop offset="100%" stop-color="#1F6FEB" />
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="${p.bg}" stroke="${p.border}" />
  <path d="M0.5 10.5a10 10 0 0 1 10-10h${w - 21}a10 10 0 0 1 10 10v${barH - 10}H0.5z" fill="${
    palette === 'dark' ? '#161B22' : '#F6F8FA'
  }" stroke="${p.border}" />
  ${dots.map((c, i) => `<circle cx="${padX - 6 + i * 18}" cy="${barH / 2}" r="6" fill="${c}" />`).join('\n  ')}
  <text x="${w / 2}" y="${barH / 2 + 4}" fill="${p.muted}" font-size="12" text-anchor="middle">${esc(handle)}@${esc(
    (company || '').toLowerCase().replace(/[^a-z]/g, ''),
  )}: ~/profile</text>

  <text x="${padX}" y="${barH + 34}" fill="${p.accent}" font-size="14">$ whoami</text>
  <text x="${padX}" y="${barH + 82}" fill="${p.text}" font-size="36" font-weight="700">${esc(name)}</text>
  <text x="${padX}" y="${barH + 112}" fill="${p.muted}" font-size="14">${esc(role)} @ ${esc(company)}</text>
  <text x="${padX}" y="${barH + 136}" fill="${p.muted}" font-size="14">${esc(location)} · coding since ${esc(
    since,
  )}</text>
  <text x="${padX}" y="${barH + 168}" fill="${p.accent}" font-size="14">$ <tspan font-size="15">▊<animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite" /></tspan></text>

  <rect x="${w - padX - 220}" y="${barH + 18}" width="220" height="1" fill="url(#glow)" opacity="0.6" />
  ${rows}
</svg>`;
}
