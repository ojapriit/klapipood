# Klapipood

Eestikeelne demoveebipood kõrvaklappidele. React 18 + TypeScript + Vite 5, staatiline rakendus (sihtkoht Vercel). Serverit, makseid ega kasutajakontosid pole — see on teadlik piirang, mitte puuduolev funktsioon.

GitHub: https://github.com/ojapriit/klapipood (avalik). Vaikeharu `main`.

## Käsud

```bash
npm run dev         # arendusserver, http://localhost:5173/
npm run lint        # ESLint, --max-warnings 0
npm run typecheck   # tsc --noEmit
npm run test        # Vitest ühiktestid (src/**/*.test.ts)
npm run build       # tsc + vite build -> dist/
npm run test:e2e    # Playwright: ehitab ja käivitab preview pordil 4173; projektid "desktop" ja "mobiil" (Pixel 7)
npm run check       # kõik ülaltoodud järjest
BASE_URL=https://… npx playwright test   # brauseritestid avaldatud versiooni vastu (eelvaade/avalik pood)
```

Esimesel korral: `npx playwright install chromium`.

## Ülesehitus

- `src/products.ts` — tooteandmed ja `formatPrice`. Hinnad on **täisarvulistes sentides** (`priceCents`); eurodeks ainult kuvamisel.
- `src/cart.ts` — ostukorvi puhas loogika (lisamine, kogused, summad, localStorage'i valideerimine). Uus ostukorvi loogika käib siia ja saab ühiktestid failis `src/cart.test.ts`.
- `src/useCart.ts` — Reacti hook, localStorage võti `klapipood:ostukorv`.
- `src/App.tsx` — vaated hash'iga (`#/` ja `#/ostukorv`), et staatiline host ei vajaks ümbersuunamisi.
- `src/components/` — `Header`, `ProductList`, `Cart`.
- `public/images/` — kohalikud SVG-illustratsioonid. Väliseid pildiaadresse ei kasutata.
- `e2e/pood.spec.ts` — brauseritestid.

## Reeglid

- Kasutajaliides ja tekstid on eesti keeles; koodikommentaarid samuti.
- Demoteade „Demopood — tellimusi ei vormistata” peab jääma nähtavaks.
- Ligipääsetavus: kõik toimib klaviatuuriga, nähtav fookus, nupud vähemalt 44 px, vaate vahetusel fookus pealkirjale. Brauseritestid otsivad elemente rolli ja ligipääsetava nime järgi — nime muutmisel uuenda teste.
- Mobiilivaade (≤ 640 px) ei tohi tekitada rõhtsat kerimist ega kattuvaid nuppe.
- Vigane localStorage'i sisu ei tohi rakendust lõhkuda.
- Olemasolevaid teste ei kustutata ega nõrgendata, et kontroll läbi läheks.

## Mida mitte teha ilma eraldi loata

- Ära liida PR-e `main`-harusse ega pushi otse `main`-i.
- Ära avalda productionisse (Vercel `--prod` vms).
- Ära muuda `.github/workflows/` faile, repo/Verceli õigusi ega saladusi tavalise poe muudatuse käigus.
- Commit'i autor selles repos on GitHubi `noreply`-aadress; ära lisa isiklikke e-posti aadresse ega saladusi.

Tavaline poe muudatus käib skilli `poe-muudatus` järgi (`.claude/skills/poe-muudatus/SKILL.md`).

## Töövoog

Kirjeldus ja ühekordne seadistus: `docs/tooprotsess.md`. Lühidalt:

1. Kasutaja annab muudatuspäringu **kohalikus Claude Code'is**.
2. Claude teeb muudatuse eraldi harus skilli `poe-muudatus` järgi, käivitab testid ja avab PR-i eestikeelse kirjeldusega (vorm: `.github/pull_request_template.md`).
3. GitHub Actions (`ci.yml`) käivitab iga PR-i puhul lint'i, tüübikontrolli, ühiktestid, build'i ja Playwrighti testid. Playwrighti raport ja ebaõnnestunud testide ekraanipildid salvestatakse artefaktidena. Kui Vercel on ühendatud, testib `avaldamise-kontroll.yml` ka eelvaadet.
4. Kasutaja otsustab: parandus käib samas harus, liitmise teeb kasutaja ise.
5. Pärast liitmist avaldab Vercel `main`-i productionisse ja `avaldamise-kontroll.yml` testib avalikku poodi.

GitHubis ei ole Claude'i API-t kasutavat automaatikat (nt `anthropics/claude-code-action`) ja seda ei lisata.
