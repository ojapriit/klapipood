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

## Töövoog GitHubis

Kirjeldus ja ühekordne seadistus: `docs/tooprotsess.md`. Lühidalt:

1. Muudatuspäring tehakse issue'na (vorm „Muudatuspäring”, silt `claude`). See käivitab `.github/workflows/claude.yml`.
2. Claude teeb muudatuse `claude/…` harus skilli `poe-muudatus` järgi ja avab PR-i.
3. `ci.yml` käivitab testid ja `avaldamise-kontroll.yml` testib Verceli eelvaadet. Mõlemad postitavad PR-ile tõendite kommentaari.
4. Inimene otsustab: kommentaar „@claude paranda: …” viib tagasi sammu 2 juurde, liitmise teeb inimene ise.
5. Pärast liitmist avaldab Vercel `main`-i productionisse. `avaldamise-kontroll.yml` testib avalikku poodi ja avab ebaõnnestumisel issue sildiga `tootmine`.

Claude ei liida PR-e ega avalda productionisse ka GitHubis. Production on Verceli automaatne samm pärast inimese tehtud liitmist.
