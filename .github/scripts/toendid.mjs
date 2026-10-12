// Koostab CI tulemustest PR-i tõendite kommentaari (Markdown, väljund stdout-i).
// Sisend:
//   reports/unit.json  – Vitesti JSON-aruanne (kui olemas)
//   reports/e2e.json   – Playwrighti JSON-aruanne (kui olemas)
//   TOENDID_PEALKIRI   – kommentaari pealkiri
//   TESTITUD_URL       – avaldatud versiooni aadress, mille vastu testiti (valikuline)
//   SAMM_<NIMI>        – sammude tulemused (success/failure/cancelled/skipped), nt SAMM_LINT=success
// Kasutus: node .github/scripts/toendid.mjs > reports/toendid.md
import { existsSync, readFileSync } from 'node:fs';

const env = process.env;

const STEPS = [
  ['SAMM_LINT', 'Lint', '`npm run lint`'],
  ['SAMM_TYPECHECK', 'Tüübikontroll', '`npm run typecheck`'],
  ['SAMM_UNIT', 'Ühiktestid', '`npm run test`'],
  ['SAMM_BUILD', 'Build', '`npm run build`'],
  ['SAMM_E2E', 'Brauseritestid', '`npm run test:e2e`'],
];

const ICON = { success: '✅', failure: '❌', cancelled: '⚠️ katkestati', skipped: '⚠️ käivitamata' };

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

const unit = readJson('reports/unit.json');
const e2e = readJson('reports/e2e.json');

function unitDetail() {
  if (!unit) return 'aruanne puudub';
  const parts = [`${unit.numPassedTests}/${unit.numTotalTests} läbis`];
  if (unit.numFailedTests) parts.push(`${unit.numFailedTests} ebaõnnestus`);
  if (unit.numPendingTests) parts.push(`${unit.numPendingTests} vahele jäetud`);
  return parts.join(', ');
}

function e2eDetail() {
  if (!e2e?.stats) return 'aruanne puudub';
  const { expected, unexpected, skipped, flaky } = e2e.stats;
  const parts = [`${expected} läbis`];
  if (unexpected) parts.push(`${unexpected} ebaõnnestus`);
  if (flaky) parts.push(`${flaky} läbis alles kordusel`);
  if (skipped) parts.push(`${skipped} vahele jäetud (projektipõhised, nt klaviatuuritest mobiilis)`);
  return parts.join(', ');
}

/** Playwrighti testid, mille staatus on `unexpected` või `flaky`, kujul „[projekt] plokk › test”. */
function e2eTests(status) {
  const out = [];
  const walk = (suite, path) => {
    const here = suite.title && !suite.title.endsWith('.ts') ? [...path, suite.title] : path;
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        if (t.status === status) out.push(`[${t.projectName}] ${[...here, spec.title].join(' › ')}`);
      }
    }
    for (const child of suite.suites ?? []) walk(child, here);
  };
  for (const s of e2e?.suites ?? []) walk(s, []);
  return out;
}

const details = { SAMM_UNIT: unitDetail, SAMM_E2E: e2eDetail };

const rows = STEPS.filter(([key]) => env[key]).map(([key, name, cmd]) => {
  const outcome = env[key];
  const icon = ICON[outcome] ?? `⚠️ ${outcome}`;
  const detail = details[key] ? ` — ${details[key]()}` : '';
  return `| ${name} | ${cmd} | ${icon}${detail} |`;
});

const allOk = STEPS.every(([key]) => !env[key] || env[key] === 'success');
const runUrl =
  env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
    ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
    : null;
const sha = (env.TESTITUD_SHA || env.GITHUB_SHA || '').slice(0, 7);

const lines = [
  `### ${env.TOENDID_PEALKIRI || 'Automaatsed testid'} — ${allOk ? '✅ kõik läbis' : '❌ esineb vigu'}`,
  '',
];
if (env.TESTITUD_URL) lines.push(`**Testitud aadress:** ${env.TESTITUD_URL}`, '');
lines.push('| Kontroll | Käsk | Tulemus |', '|---|---|---|', ...rows, '');

const failed = e2eTests('unexpected');
if (failed.length) lines.push('**Ebaõnnestunud brauseritestid:**', ...failed.map((t) => `- ${t}`), '');
const flaky = e2eTests('flaky');
if (flaky.length) lines.push('**Ebastabiilsed (läbisid kordusel):**', ...flaky.map((t) => `- ${t}`), '');

const meta = [];
if (sha) meta.push(`commit \`${sha}\``);
if (runUrl) meta.push(`[käivituse logi ja aruanded](${runUrl})`);
if (meta.length) lines.push(`<sub>${meta.join(' · ')} · uuendatakse iga käivitusega</sub>`);

console.log(lines.join('\n'));
