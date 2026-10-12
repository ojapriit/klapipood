# Klapipood

Lihtne eestikeelne demoveebipood kõrvaklappidele. Ehitatud **React + TypeScript + Vite** peale ja sobib staatilise veebina avaldamiseks (nt Vercel).

> Demopood — tellimusi ei vormistata. Makselahendust, kasutajakontosid ega serverit pole.

## Funktsionaalsus

- Avalehel kuus väljamõeldud toodet: nimi, illustratsioon, lühikirjeldus ja hind eurodes.
- Igal tootel nupp „Lisa ostukorvi”. Sama toote uuesti lisamine suurendab olemasoleva rea kogust.
- Päises ostukorvi nupp koos toodete koguarvuga.
- Ostukorvi vaade: tooted, kogused, koguse muutmine (−/+ või sisestus), eemaldamine ja kogusumma.
- Ostukorv säilib lehe värskendamisel (`localStorage`, võti `klapipood:ostukorv`) ja sünkroonib avatud vahelehtede vahel.
- Tühja ostukorvi korral selge teade ja link toodete juurde.
- Telefonis kasutatav ja klaviatuuriga juhitav: „Liigu sisu juurde” link, nähtav fookus, fookus liigub vaate vahetusel pealkirjale, ekraanilugejale teavitus toote lisamisest.
- Illustratsioonid on kohalikud SVG-failid kaustas `public/images/` — väliseid pildiaadresse pole.

## Nõuded

- Node.js 18 või uuem (testitud Node 22-ga)
- npm

## Käivitamine

```bash
npm install
npm run dev
```

Seejärel ava brauseris terminalis näidatud aadress (vaikimisi <http://localhost:5173/>).

## Tootmisversioon

```bash
npm run build     # tüübikontroll ja ehitus kausta dist/
npm run preview   # serveerib ehitatud versiooni kohalikult (vaikimisi http://localhost:4173/)
```

## Kontrollid

| Käsk | Mida teeb |
| --- | --- |
| `npm run lint` | ESLint (hoiatusi ei lubata) |
| `npm run typecheck` | TypeScripti tüübikontroll |
| `npm run test` | Vitesti ühiktestid (`src/*.test.ts`, ostukorvi loogika) |
| `npm run test:e2e` | Playwrighti brauseritestid (`e2e/`), lauaarvuti- ja mobiilivaates (Pixel 7) |
| `npm run build` | Tüübikontroll ja tootmisversiooni ehitus kausta `dist/` |
| `npm run check` | Kõik ülaltoodud järjest |

Enne esimest brauseritestide käivitamist laadi Chromium alla:

```bash
npx playwright install chromium
```

Brauseritestid ehitavad tootmisversiooni ja käivitavad selle pordil 4173.

Rahasummad arvutatakse täisarvulistes sentides (`priceCents`), eurodeks vormindatakse need alles kuvamisel.

## Avaldamine Vercelis

Projekt on tavaline Vite staatiline rakendus, Vercel tuvastab seadistuse automaatselt:

- Build Command: `npm run build`
- Output Directory: `dist`

Ostukorvi vaade kasutab aadressi `#/ostukorv`, seega serveripoolseid ümbersuunamisi pole vaja. Seadistus on ka failis `vercel.json`.

## Töövoog

Muudatuspäring kohalikus Claude Code'is → Claude teeb muudatuse eraldi harus → PR, GitHub Actionsi testid ja Verceli eelvaade → sinu otsus (paranda / merge) → production → avaliku poe kontroll. Kirjeldus ja ühekordne seadistus on failis [`docs/tooprotsess.md`](docs/tooprotsess.md).

## Struktuur

```
public/images/        toodete SVG-illustratsioonid
src/products.ts       tooteandmed ja hinnavorming
src/cart.ts           ostukorvi puhas loogika (lisamine, kogused, summad, localStorage'i valideerimine)
src/cart.test.ts      ühiktestid
src/useCart.ts        Reacti hook: olek ja localStorage
e2e/pood.spec.ts      brauseritestid
src/App.tsx           vaadete vahetus, demoteade, teavitused
src/components/       Header, ProductList, Cart
src/styles.css        kujundus
```
