---
name: poe-muudatus
description: Klapipoe tavapärase muudatuse protsess muudatussoovist PR-ini — vastuvõtutingimused, eraldi haru, muudatus koos testidega, kõik kontrollid (lint, tüübikontroll, ühiktestid, brauseritestid, build), PR ja eestikeelne ülevaade. Kasuta, kui kasutaja palub poes midagi muuta, lisada või parandada (tooted, ostukorv, kujundus, tekstid, ligipääsetavus jne).
---

# Poe muudatus

Vii muudatussoov läbi alltoodud sammudes. Ära jäta samme vahele. Kui mõni samm ei õnnestu, ütle seda ülevaates ausalt.

## Keelatud selle protsessi käigus

- **PR-i ei liideta** `main`-harusse (`gh pr merge` jms on keelatud) ja `main`-i ei pushita otse.
- **Productionisse ei avaldata** (nt `vercel --prod`, production-domeeni muutmine).
- **Ei muudeta** `.github/workflows/` faile, haru kaitsereegleid, repo või Verceli õigusi ega saladusi. Kui muudatus seda tõesti nõuaks, peatu ja küsi kasutajalt.
- **Kontrolli ei märgita edukaks**, kui see ebaõnnestus, katkes või jäi käivitamata. Teste ei kustutata, ei jäeta vahele (`.skip`, `.only`) ega nõrgendata, et need läbi läheksid.

## 1. Loe muudatussoov ja praegune lahendus

- Loe kasutaja soov läbi ja loe `CLAUDE.md`.
- Loe läbi failid, mida muudatus puudutab, ja nendega seotud testid (`src/*.test.ts`, `e2e/*.spec.ts`).
- Kontrolli lähtekohta: `git status` peab olema puhas ja `main` ajakohane (`git fetch origin && git status`). Kui töökaustas on kasutaja salvestamata muudatusi, ära kirjuta neid üle — küsi kasutajalt.
- Kui soov on mitmeti mõistetav ja vastus muudaks tulemust oluliselt, küsi enne alustamist. Väiksemate küsimuste puhul tee mõistlik valik ja kirjuta see ülevaatesse.

## 2. Määra kontrollitavad vastuvõtutingimused

Kirjuta enne koodi muutmist üles nummerdatud vastuvõtutingimused (VT1, VT2, …). Iga tingimus peab olema:

- konkreetne ja kontrollitav: kirjelda tegevust ja oodatavat tulemust, mitte „toimib hästi”;
- seotud kontrolliga: ühik- või brauseritest või põhjendatud käsitsi kontroll.

Lisa alati tingimus „olemasolev funktsionaalsus jääb tööle” — selle kontrolliks on kõik olemasolevad testid. Näita tingimusi kasutajale lühidalt ja jätka.

## 3. Loo eraldi haru

```bash
git switch main && git pull --ff-only
git switch -c <tüüp>/<lühike-kirjeldus>   # nt feature/toote-filter, fix/mobiili-kogus
```

Haru nimes kasuta ladina tähti, ilma täpitähtedeta.

## 4. Tee muudatus

- Järgi `CLAUDE.md` reegleid: hinnad sentides, ostukorvi loogika `src/cart.ts`-is, tekstid eesti keeles, ligipääsetavus, mobiilivaade, kohalikud pildid.
- Hoia muudatus soovi piires; ära tee kõrvalisi refaktoreid.

## 5. Lisa testid

- Iga vastuvõtutingimus saab vähemalt ühe automaatse kontrolli: loogika `src/cart.test.ts`-is või uues `src/*.test.ts` failis, kasutaja voog `e2e/`-s. Kui automaattest pole mõistlik, kirjuta ülevaatesse, miks, ja kuidas kontrollisid käsitsi.
- Kasutajaliidese muudatusi kontrolli ka mobiiliprojektis (Pixel 7).
- Olemasolevaid teste ei kustutata. Kui muudatus muudab teadlikult käitumist (nt nupu nime), uuenda testi ja kirjuta see ülevaatesse.

## 6. Käivita kõik kontrollid

Käivita iga kontroll eraldi ja salvesta tegelik tulemus (exit code ja kokkuvõte):

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Kui Playwrighti brauser puudub, käivita `npx playwright install chromium` ja proovi uuesti. Kui kontroll jääb ka siis käivitamata, märgi see staatusega „käivitamata” ja kirjuta põhjus.

## 7. Paranda vead ja korda kontrolle

- Kui kontroll ebaõnnestub, otsi põhjus (veateade, `test-results/**/error-context.md`, trace) ja paranda **kood**, mitte test — välja arvatud juhul, kui test ise on vigane. Sel juhul põhjenda ülevaates.
- Pärast parandust käivita uuesti ebaõnnestunud kontroll ja kõik kontrollid, mida parandus võis mõjutada. Enne commit'i peab viimane täielik käivitus (`npm run check` või kõik viis eraldi) olema roheline.
- Kui pärast mõistlikku pingutust jääb mõni kontroll punaseks, ära varja seda: loo PR draft'ina (`--draft`) ja kirjelda probleem.

## 8. Salvesta muudatus ja loo PR

```bash
git add <muudetud failid>      # ära lisa ignoreeritud ega ajutisi faile
git diff --cached --stat       # kontrolli üle, et sisse ei läheks saladusi ega isikuandmeid
git commit                     # eestikeelne sõnum: mida ja miks
git push -u origin HEAD
gh pr create --base main --title "<eestikeelne pealkiri>" --body-file <fail>
```

PR-i kirjelduse sisu on sama mis allpool ülevaates. **Ära liida PR-i.**

Pärast PR-i loomist:

- Oota GitHub Actionsi CI tulemust: `gh pr checks <nr> --watch`. Lisa tegelik tulemus ülevaatesse.
- Leia eelvaate link. Kui repo on ühendatud Verceliga, lisab Vercel PR-ile eelvaate (deployment/check või kommentaar). Otsi seda nii: `gh pr checks <nr>`, `gh pr view <nr> --comments` või `gh api repos/{owner}/{repo}/deployments`. Kui eelvaadet pole, kirjuta „Eelvaade puudub — <põhjus>”. Ära mõtle linki välja ja ära avalda eelvaate saamiseks ise midagi productionisse.

## 9. Esita eestikeelne muudatuse ülevaade

Vasta kasutajale eesti keeles selles vormis:

```markdown
## Muudatuse ülevaade: <pealkiri>

**Eesmärk:** <miks muudatus tehti; 1–2 lauset>

**Vastuvõtutingimused**
| | Tingimus | Kontroll | Tulemus |
|---|---|---|---|
| VT1 | … | e2e: „<testi nimi>” | ✅ läbis / ❌ ebaõnnestus / ⚠️ käivitamata |

**Enne / pärast**
| Enne | Pärast |
|---|---|
| <praegune käitumine> | <uus käitumine> |

**Testitulemused** (viimane käivitus)
| Kontroll | Käsk | Tulemus |
|---|---|---|
| Lint | `npm run lint` | ✅ / ❌ / ⚠️ käivitamata — <põhjus> |
| Tüübikontroll | `npm run typecheck` | … |
| Ühiktestid | `npm run test` | ✅ N/N läbis |
| Brauseritestid | `npm run test:e2e` | ✅ N läbis, M vahele jäetud (põhjus) |
| Build | `npm run build` | … |
| GitHub Actions CI | PR-i kontroll | ✅ / ❌ / ⏳ veel töös |

Uued või muudetud testid: <loetelu>

**Parandatud vead protsessi käigus:** <või „puuduvad”>

**Piirangud ja märkused:** <mida ei kontrollitud (nt ainult Chromium, päris seadmeid ei kasutatud), teadlikud valikud, avatud küsimused>

**Eelvaade:** <link> või „Eelvaade puudub — <põhjus>”
**PR:** <link> (ei ole liidetud)
```

Ülevaate reeglid:

- Märgi ✅ ainult kontrollile, mille sa käivitasid ja mis lõppes edukalt. Ebaõnnestunud kontroll on ❌, käivitamata kontroll on ⚠️, ja mõlemal juhul kirjuta põhjus.
- Numbrid (testide arv jne) võta tegelikust väljundist, mitte mälust.
- Ütle selgelt, et PR on liitmata ja productionisse pole midagi avaldatud.
