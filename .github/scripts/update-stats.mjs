#!/usr/bin/env node
/**
 * Regenerates the <!-- STATS:START --> ... <!-- STATS:END --> block in README.md
 * from live GitHub GraphQL data (private contributions included).
 *
 * Requires GH_TOKEN with `read:user` + `repo` scope (a classic PAT of the
 * profile owner). GITHUB_TOKEN cannot see private contributions.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { heatmap, languages, header } from './render-cards.mjs';

const LOGIN = process.env.PROFILE_LOGIN || 'Maple0922';
const TOKEN = process.env.GH_TOKEN;
const README = fileURLToPath(new URL('../../README.md', import.meta.url));
const ASSETS = fileURLToPath(new URL('../../assets/', import.meta.url));
const WIDTH = 60; // inner width of the ASCII boxes

if (!TOKEN) {
  console.error('GH_TOKEN is required.');
  process.exit(1);
}

async function gql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': `${LOGIN}-profile-readme`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
}

// ---------------------------------------------------------------- fetch

const base = await gql(
  `query($login:String!){
    user(login:$login){
      createdAt
      followers { totalCount }
      pullRequests { totalCount }
      issues { totalCount }
      repositoriesContributedTo(
        includeUserRepositories:true
        contributionTypes:[COMMIT,PULL_REQUEST,ISSUE,REPOSITORY,PULL_REQUEST_REVIEW]
      ){ totalCount }
      repositories(first:100, ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC){
        nodes { languages(first:10, orderBy:{field:SIZE, direction:DESC}){ edges { size node { name color } } } }
      }
    }
  }`,
  { login: LOGIN },
);

const user = base.user;
const firstYear = new Date(user.createdAt).getUTCFullYear();
const thisYear = new Date().getUTCFullYear();
const years = [];
for (let y = firstYear; y <= thisYear; y++) years.push(y);

const yearQuery = `query($login:String!){
  user(login:$login){
    ${years
      .map(
        (y) => `y${y}: contributionsCollection(from:"${y}-01-01T00:00:00Z", to:"${y}-12-31T23:59:59Z"){
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }`,
      )
      .join('\n    ')}
  }
}`;
const perYear = (await gql(yearQuery, { login: LOGIN })).user;

// ---------------------------------------------------------------- reduce

/** date (YYYY-MM-DD) -> contribution count, across the whole account lifetime */
const days = new Map();
const yearTotals = [];

for (const y of years) {
  const cal = perYear[`y${y}`].contributionCalendar;
  yearTotals.push({ year: y, total: cal.totalContributions });
  for (const week of cal.weeks) {
    for (const d of week.contributionDays) {
      // Week buckets spill over year boundaries and report 0 outside the
      // queried range, so never let a 0 overwrite a real value.
      days.set(d.date, Math.max(days.get(d.date) ?? 0, d.contributionCount));
    }
  }
}

const sorted = [...days.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
const allTime = yearTotals.reduce((a, b) => a + b.total, 0);

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() - n);
  return iso(d);
};

const sumSince = (from) =>
  sorted.reduce((acc, [date, n]) => (date >= from && date <= iso(today) ? acc + n : acc), 0);

const last365 = sumSince(daysAgo(364));
const last30 = sumSince(daysAgo(29));

// current streak: walk backwards from today (today may still be empty)
let current = 0;
for (let i = 0; ; i++) {
  const n = days.get(daysAgo(i)) ?? 0;
  if (n > 0) current++;
  else if (i > 0) break;
}

// longest streak over the whole history
let longest = 0;
let run = 0;
let longestEnd = '';
let prev = null;
for (const [date, n] of sorted) {
  const gap = prev ? (Date.parse(date) - Date.parse(prev)) / 86400000 : 1;
  run = n > 0 ? (gap === 1 ? run + 1 : 1) : 0;
  if (run > longest) {
    longest = run;
    longestEnd = date;
  }
  prev = date;
}

const busiest = sorted.reduce((best, cur) => (cur[1] > best[1] ? cur : best), ['-', 0]);
const activeDays = sorted.filter(([, n]) => n > 0).length;

// last 12 months, for the sparkline
const months = [];
for (let i = 11; i >= 0; i--) {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
  const key = iso(d).slice(0, 7);
  const total = sorted.reduce((acc, [date, n]) => (date.startsWith(key) ? acc + n : acc), 0);
  months.push({ key, label: key.slice(5), total });
}

// ---------------------------------------------------------------- render

const num = (n) => n.toLocaleString('en-US');
const SPARK = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

function bar(value, max, width) {
  const filled = max > 0 ? Math.round((value / max) * width) : 0;
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
}

function boxTop(title) {
  const head = `╭─ ${title} `;
  return head + '─'.repeat(Math.max(0, WIDTH + 2 - head.length)) + '╮';
}
const BOX_BOTTOM = '╰' + '─'.repeat(WIDTH + 1) + '╯';
const line = (content = '') => `│ ${content.padEnd(WIDTH - 1)} │`;

function dotted(label, value) {
  const v = String(value);
  const dots = Math.max(1, WIDTH - 1 - label.length - v.length - 2);
  return `${label} ${'·'.repeat(dots)} ${v}`;
}

const maxYear = Math.max(...yearTotals.map((y) => y.total));
const maxMonth = Math.max(...months.map((m) => m.total), 1);
const widest = num(maxYear).length;
const yearBarWidth = WIDTH - 1 - (4 + 2 + 2 + widest + 2);

const out = [];
out.push('```console');
out.push(`$ gh contributions --user ${LOGIN} --include-private`);
out.push('');
out.push(boxTop('SUMMARY'));
out.push(line(dotted('Contributions (last 365 days)', num(last365))));
out.push(line(dotted('Contributions (all time)', num(allTime))));
out.push(line(dotted('Contributions (last 30 days)', num(last30))));
out.push(line(dotted('Pull requests opened', num(user.pullRequests.totalCount))));
out.push(line(dotted('Issues opened', num(user.issues.totalCount))));
out.push(line(dotted('Repositories contributed to', num(user.repositoriesContributedTo.totalCount))));
out.push(line());
out.push(line(dotted('Current streak', `${num(current)} days`)));
out.push(line(dotted('Longest streak', `${num(longest)} days`)));
out.push(line(dotted('Active days', num(activeDays))));
out.push(line(dotted('Busiest day', `${busiest[0]} (${num(busiest[1])})`)));
out.push(BOX_BOTTOM);
out.push('');
out.push(boxTop('BY YEAR'));
for (const { year, total } of yearTotals) {
  const flag = year === thisYear ? ' ←' : '';
  out.push(line(`${year}  ${bar(total, maxYear, yearBarWidth)}  ${num(total).padStart(widest)}${flag}`));
}
out.push(BOX_BOTTOM);
out.push('');
out.push(boxTop('LAST 12 MONTHS'));
out.push(line(`  ${months.map((m) => ` ${SPARK[Math.min(7, Math.floor((m.total / maxMonth) * 7.999))]}`).join(' ')}`));
out.push(line(`  ${months.map((m) => m.label).join(' ')}`));
out.push(line());
const peak = months.reduce((a, b) => (b.total > a.total ? b : a));
const avg = Math.round(months.slice(0, -1).reduce((a, m) => a + m.total, 0) / 11);
out.push(line(`  peak ${peak.key} (${num(peak.total)})  ·  avg ${num(avg)} / month`));
out.push(line('  * the rightmost month is still in progress'));
out.push(BOX_BOTTOM);
out.push('```');
out.push('');
out.push(
  `<sub>🤖 Auto-generated from the GitHub GraphQL API · last run ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC</sub>`,
);

// ---------------------------------------------------------------- svg cards

const byLang = new Map();
for (const repo of user.repositories.nodes) {
  for (const { size, node } of repo.languages.edges) {
    const cur = byLang.get(node.name) ?? { name: node.name, color: node.color, size: 0 };
    cur.size += size;
    byLang.set(node.name, cur);
  }
}
const ranked = [...byLang.values()].sort((a, b) => b.size - a.size);
const TOP = 8;
const topLangs = ranked.slice(0, TOP);
const restSize = ranked.slice(TOP).reduce((a, l) => a + l.size, 0);
if (restSize > 0) topLangs.push({ name: 'Other', color: '#8B949E', size: restSize });

const hero = {
  name: 'Futo Nakajima',
  handle: LOGIN.toLowerCase(),
  role: 'Software Engineer',
  company: 'Wizleap Inc.',
  location: 'Tokyo, Japan',
  since: firstYear,
  metrics: [
    { label: 'contributions / yr', value: num(last365) },
    { label: 'pull requests', value: num(user.pullRequests.totalCount) },
    { label: 'all-time', value: num(allTime) },
  ],
};

mkdirSync(ASSETS, { recursive: true });
for (const palette of ['dark', 'light']) {
  writeFileSync(`${ASSETS}header-${palette}.svg`, header(hero, { palette }));
  writeFileSync(`${ASSETS}contributions-${palette}.svg`, heatmap(days, { total: last365, palette }));
  writeFileSync(`${ASSETS}languages-${palette}.svg`, languages(topLangs, { palette }));
}
console.log(`Rendered 6 SVG cards (top language: ${topLangs[0].name}).`);

// ---------------------------------------------------------------- write

const block = out.join('\n');
const readme = readFileSync(README, 'utf8');
const START = '<!-- STATS:START -->';
const END = '<!-- STATS:END -->';
const from = readme.indexOf(START);
const to = readme.indexOf(END);
if (from === -1 || to === -1) throw new Error('STATS markers not found in README.md');

const next = `${readme.slice(0, from + START.length)}\n${block}\n${readme.slice(to)}`;
if (next === readme) {
  console.log('No changes.');
} else {
  writeFileSync(README, next);
  console.log(`Updated: ${num(last365)} contributions in the last 365 days.`);
}
