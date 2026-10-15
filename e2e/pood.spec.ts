import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'klapipood:ostukorv';

/** Intl.NumberFormat kasutab tuhandete eraldaja ja € ees kitsast/tavalist tühikut. */
const euro = (amount: string) => new RegExp(`^${amount.replace(/\s/g, '\\s')}\\s€$`);

const cartLink = (page: Page) => page.getByRole('link', { name: /^Ostukorv,/ });
const cartCount = (page: Page) => page.locator('.cart-count');
const addButton = (page: Page, name: string) =>
  page.getByRole('button', { name: `Lisa ostukorvi: ${name}` });
const cartLines = (page: Page) => page.locator('.cart-line');
const total = (page: Page) => page.locator('.cart-summary .total strong');

test.beforeEach(async ({ page }) => {
  // Kõik lehe JS-vead kukutavad testi.
  page.on('pageerror', (err) => {
    throw err;
  });
});

test('avalehel kuvatakse kuus toodet ja demoteade', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kõrvaklapid igaks päevaks');
  await expect(page.locator('.product-card')).toHaveCount(6);
  await expect(page.getByRole('button', { name: /^Lisa ostukorvi/ })).toHaveCount(6);
  await expect(page.locator('.product-card img')).toHaveCount(6);
  for (const img of await page.locator('.product-card img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.getByText('Demopood — tellimusi ei vormistata', { exact: true })).toBeVisible();
});

test('toote lisamine uuendab ostukorvi loendurit', async ({ page }) => {
  await page.goto('/');
  await expect(cartCount(page)).toHaveText('0');
  await addButton(page, 'Sadu Pods').click();
  await expect(cartCount(page)).toHaveText('1');
  await expect(cartLink(page)).toHaveAccessibleName('Ostukorv, 1 toode');
  await addButton(page, 'Põhjala ANC').click();
  await expect(cartCount(page)).toHaveText('2');
  await expect(cartLink(page)).toHaveAccessibleName('Ostukorv, 2 toodet');
});

test.describe('avalehel koguse vähendamine ja eemaldamine', () => {
  const card = (page: Page, name: string) =>
    page.locator('.product-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
  const decreaseButton = (page: Page, name: string) =>
    page.getByRole('button', { name: `Vähenda kogust: ${name}` });
  const removeButton = (page: Page, name: string) =>
    page.getByRole('button', { name: `Eemalda ostukorvist: ${name}` });

  test('nupud ilmuvad ainult ostukorvis olevale tootele', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^Vähenda kogust:/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Eemalda ostukorvist:/ })).toHaveCount(0);

    await addButton(page, 'Sadu Pods').click();
    await expect(card(page, 'Sadu Pods')).toContainText('Ostukorvis: 1 tk');
    await expect(decreaseButton(page, 'Sadu Pods')).toBeVisible();
    await expect(removeButton(page, 'Sadu Pods')).toBeVisible();
    await expect(removeButton(page, 'Sadu Pods')).toHaveText('Eemalda');
    await expect(page.getByRole('button', { name: /^Vähenda kogust:/ })).toHaveCount(1);

    for (const btn of [decreaseButton(page, 'Sadu Pods'), removeButton(page, 'Sadu Pods')]) {
      const box = (await btn.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('vähendamine vähendab kogust ja kogusel 1 eemaldab toote', async ({ page }) => {
    await page.goto('/');
    await addButton(page, 'Stuudio 7').click();
    await addButton(page, 'Stuudio 7').click();
    await addButton(page, 'Stuudio 7').click();
    await expect(cartCount(page)).toHaveText('3');

    await decreaseButton(page, 'Stuudio 7').click();
    await expect(card(page, 'Stuudio 7')).toContainText('Ostukorvis: 2 tk');
    await expect(cartCount(page)).toHaveText('2');
    await expect(page.getByRole('status')).toHaveText(/Stuudio 7 kogus vähenes/);

    await decreaseButton(page, 'Stuudio 7').click();
    await decreaseButton(page, 'Stuudio 7').click();
    await expect(cartCount(page)).toHaveText('0');
    await expect(card(page, 'Stuudio 7')).not.toContainText('Ostukorvis');
    await expect(decreaseButton(page, 'Stuudio 7')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText(/Stuudio 7 eemaldati ostukorvist/);
  });

  test('eemaldamine eemaldab ainult selle toote ja püsib värskendamisel', async ({ page }) => {
    await page.goto('/');
    await addButton(page, 'Laine Bluetooth').click();
    await addButton(page, 'Laine Bluetooth').click();
    await addButton(page, 'Jooks Sport').click();
    await expect(cartCount(page)).toHaveText('3');

    await removeButton(page, 'Laine Bluetooth').click();
    await expect(cartCount(page)).toHaveText('1');
    await expect(card(page, 'Laine Bluetooth')).not.toContainText('Ostukorvis');
    await expect(card(page, 'Jooks Sport')).toContainText('Ostukorvis: 1 tk');

    await page.reload();
    await expect(cartCount(page)).toHaveText('1');
    await cartLink(page).click();
    await expect(cartLines(page)).toHaveCount(1);
    await expect(cartLines(page)).toContainText('Jooks Sport');
  });

  test('klaviatuuriga eemaldamisel liigub fookus lisamisnupule', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Klaviatuurivoog on mõeldud lauaarvutile');
    await page.goto('/');
    await addButton(page, 'Sadu Pods').focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await decreaseButton(page, 'Sadu Pods').focus();
    await page.keyboard.press('Enter');
    await expect(card(page, 'Sadu Pods')).toContainText('Ostukorvis: 1 tk');
    await expect(decreaseButton(page, 'Sadu Pods')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(removeButton(page, 'Sadu Pods')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(cartCount(page)).toHaveText('0');
    await expect(addButton(page, 'Sadu Pods')).toBeFocused();
  });

  test('mobiilis pole rõhtsat kerimist ega kattuvaid nuppe', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Ainult mobiiliprojektis');
    await page.goto('/');
    await addButton(page, 'Põhjala ANC').tap();
    await expect(decreaseButton(page, 'Põhjala ANC')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    ).toBe(true);

    const boxes = await Promise.all(
      [addButton(page, 'Põhjala ANC'), decreaseButton(page, 'Põhjala ANC'), removeButton(page, 'Põhjala ANC')].map(
        async (b) => (await b.boundingBox())!,
      ),
    );
    const overlaps = (a: (typeof boxes)[0], b: (typeof boxes)[0]) =>
      a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) expect(overlaps(boxes[i], boxes[j])).toBe(false);

    await decreaseButton(page, 'Põhjala ANC').tap();
    await expect(cartCount(page)).toHaveText('0');
  });
});

test('sama toote kaks lisamist annab ühe rea kogusega kaks', async ({ page }) => {
  await page.goto('/');
  await addButton(page, 'Sadu Pods').click();
  await addButton(page, 'Sadu Pods').click();
  await cartLink(page).click();
  await expect(cartLines(page)).toHaveCount(1);
  await expect(page.getByRole('spinbutton', { name: 'Sadu Pods kogus' })).toHaveValue('2');
  await expect(total(page)).toHaveText(euro('158,00'));
});

test('kahe erineva toote kogusumma on õige', async ({ page }) => {
  await page.goto('/');
  await addButton(page, 'Põhjala ANC').click();
  await addButton(page, 'Vikerkaar Junior').click();
  await cartLink(page).click();
  await expect(cartLines(page)).toHaveCount(2);
  // 189,00 + 39,00
  await expect(total(page)).toHaveText(euro('228,00'));
});

test('koguse muutmine uuendab kogusummat', async ({ page }) => {
  await page.goto('/');
  await addButton(page, 'Laine Bluetooth').click();
  await cartLink(page).click();
  await expect(total(page)).toHaveText(euro('99,00'));

  await page.getByRole('button', { name: 'Suurenda toote Laine Bluetooth kogust' }).click();
  await expect(total(page)).toHaveText(euro('198,00'));
  await expect(cartCount(page)).toHaveText('2');

  const input = page.getByRole('spinbutton', { name: 'Laine Bluetooth kogus' });
  await input.fill('5');
  await expect(total(page)).toHaveText(euro('495,00'));

  await page.getByRole('button', { name: 'Vähenda toote Laine Bluetooth kogust' }).click();
  await expect(input).toHaveValue('4');
  await expect(total(page)).toHaveText(euro('396,00'));
});

test('toote eemaldamine töötab ja tühja ostukorvi teade kuvatakse', async ({ page }) => {
  await page.goto('/');
  await addButton(page, 'Sadu Pods').click();
  await addButton(page, 'Jooks Sport').click();
  await cartLink(page).click();
  await expect(cartLines(page)).toHaveCount(2);

  await page.getByRole('button', { name: 'Eemalda toode Sadu Pods' }).click();
  await expect(cartLines(page)).toHaveCount(1);
  await expect(cartLines(page)).toContainText('Jooks Sport');
  await expect(total(page)).toHaveText(euro('59,00'));

  await page.getByRole('button', { name: 'Eemalda toode Jooks Sport' }).click();
  await expect(cartLines(page)).toHaveCount(0);
  await expect(page.getByText('Sinu ostukorv on tühi.')).toBeVisible();
  await expect(cartCount(page)).toHaveText('0');
});

test.describe('ostukorvi tühjendamine', () => {
  const clearButton = (page: Page) => page.getByRole('button', { name: 'Tühjenda ostukorv' });

  test('nupp on pealkirjaga samal real päise ostukorvi nupu all', async ({ page }) => {
    await page.goto('/');
    await addButton(page, 'Sadu Pods').click();
    await cartLink(page).click();

    const button = clearButton(page);
    await expect(button).toBeVisible();
    // Nähtav tekst on „Tühjenda”; „ostukorv” on ainult ekraanilugejale.
    const visibleText = await button.evaluate((el) => {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.visually-hidden').forEach((n) => n.remove());
      return clone.textContent?.trim();
    });
    expect(visibleText).toBe('Tühjenda');
    await expect(button.locator('svg')).toBeVisible();

    const heading = await page.getByRole('heading', { level: 1, name: 'Ostukorv' }).boundingBox();
    const btn = (await button.boundingBox())!;
    const headerCart = (await cartLink(page).boundingBox())!;
    expect(btn.height).toBeGreaterThanOrEqual(44);
    // Samal real: vertikaalsed keskpunktid kattuvad, pealkiri vasakul.
    const mid = (b: { y: number; height: number }) => b.y + b.height / 2;
    expect(Math.abs(mid(btn) - mid(heading!))).toBeLessThan(btn.height / 2);
    expect(heading!.x + heading!.width).toBeLessThanOrEqual(btn.x);
    // Päise ostukorvi nupu all: paremad servad joonduvad.
    expect(btn.y).toBeGreaterThan(headerCart.y + headerCart.height);
    expect(Math.abs(btn.x + btn.width - (headerCart.x + headerCart.width))).toBeLessThanOrEqual(1);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    ).toBe(true);
  });

  test('tühjendamine eemaldab kõik read ja püsib värskendamisel', async ({ page }) => {
    await page.goto('/');
    await addButton(page, 'Sadu Pods').click();
    await addButton(page, 'Sadu Pods').click();
    await addButton(page, 'Jooks Sport').click();
    await cartLink(page).click();
    await expect(cartLines(page)).toHaveCount(2);

    await clearButton(page).click();
    await expect(cartLines(page)).toHaveCount(0);
    await expect(page.getByText('Sinu ostukorv on tühi.')).toBeVisible();
    await expect(cartCount(page)).toHaveText('0');
    await expect(clearButton(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'Ostukorv' })).toBeFocused();

    await page.reload();
    await expect(page.getByText('Sinu ostukorv on tühi.')).toBeVisible();
    await expect(cartCount(page)).toHaveText('0');
    expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe('[]');
  });

  test('tühjas ostukorvis nuppu ei kuvata', async ({ page }) => {
    await page.goto('/#/ostukorv');
    await expect(page.getByText('Sinu ostukorv on tühi.')).toBeVisible();
    await expect(clearButton(page)).toHaveCount(0);
  });

  test('tühjendamine töötab klaviatuuriga', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Klaviatuurivoog on mõeldud lauaarvutile');
    await page.goto('/');
    await addButton(page, 'Laine Bluetooth').click();
    await cartLink(page).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Ostukorv' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(clearButton(page)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(cartLines(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'Ostukorv' })).toBeFocused();
  });
});

test('tühja ostukorvi teade kuvatakse otse ostukorvi avades', async ({ page }) => {
  await page.goto('/#/ostukorv');
  await expect(page.getByRole('heading', { level: 1, name: 'Ostukorv' })).toBeVisible();
  await expect(page.getByText('Sinu ostukorv on tühi.')).toBeVisible();
  await page.getByRole('link', { name: 'Vaata tooteid' }).click();
  await expect(page.locator('.product-card')).toHaveCount(6);
});

test('ostukorv säilib lehe värskendamisel', async ({ page }) => {
  await page.goto('/');
  await addButton(page, 'Stuudio 7').click();
  await addButton(page, 'Stuudio 7').click();
  await addButton(page, 'Sadu Pods').click();
  await page.reload();
  await expect(cartCount(page)).toHaveText('3');

  await cartLink(page).click();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Ostukorv' })).toBeVisible();
  await expect(cartLines(page)).toHaveCount(2);
  await expect(page.getByRole('spinbutton', { name: 'Stuudio 7 kogus' })).toHaveValue('2');
  // 2 × 145,00 + 79,00
  await expect(total(page)).toHaveText(euro('369,00'));
});

test.describe('vigane localStorage', () => {
  const badValues = [
    '{ei ole json',
    '{"productId":"sadu"}',
    'null',
    JSON.stringify([{ productId: 'olematu', quantity: 3 }, { productId: 'sadu', quantity: 'kaks' }]),
  ];

  for (const value of badValues) {
    test(`ei lõhu rakendust: ${value}`, async ({ page }) => {
      await page.addInitScript(
        ([key, v]) => {
          if (!sessionStorage.getItem('seeded')) {
            localStorage.setItem(key, v);
            sessionStorage.setItem('seeded', '1');
          }
        },
        [STORAGE_KEY, value],
      );
      await page.goto('/');
      await expect(page.locator('.product-card')).toHaveCount(6);
      await expect(cartCount(page)).toHaveText('0');
      await addButton(page, 'Sadu Pods').click();
      await expect(cartCount(page)).toHaveText('1');
      // Vigane sisu kirjutatakse üle kehtivaga.
      const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual([{ productId: 'sadu', quantity: 1 }]);
    });
  }

  test('jätab kehtivad read alles', async ({ page }) => {
    await page.addInitScript(
      ([key, v]) => localStorage.setItem(key, v),
      [STORAGE_KEY, JSON.stringify([{ productId: 'olematu', quantity: 1 }, { productId: 'laine', quantity: 2 }])],
    );
    await page.goto('/#/ostukorv');
    await expect(cartLines(page)).toHaveCount(1);
    await expect(total(page)).toHaveText(euro('198,00'));
  });
});

test('klaviatuuriga saab toote lisada ja ostukorvi avada', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Klaviatuurivoog on mõeldud lauaarvutile');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Liigu sisu juurde' })).toBeFocused();

  await addButton(page, 'Sadu Pods').focus();
  await page.keyboard.press('Enter');
  await expect(cartCount(page)).toHaveText('1');

  await cartLink(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Ostukorv' })).toBeFocused();

  await page.getByRole('button', { name: 'Suurenda toote Sadu Pods kogust' }).focus();
  await page.keyboard.press('Space');
  await expect(total(page)).toHaveText(euro('158,00'));
});

test('põhivoog töötab mobiili mõõtudega', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Ainult mobiiliprojektis');
  await page.goto('/');
  const viewport = page.viewportSize()!;
  expect(viewport.width).toBeLessThan(500);

  const noHorizontalScroll = () =>
    page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  expect(await noHorizontalScroll()).toBe(true);

  await addButton(page, 'Vikerkaar Junior').tap();
  await addButton(page, 'Vikerkaar Junior').tap();
  await addButton(page, 'Põhjala ANC').tap();
  await expect(cartCount(page)).toHaveText('3');
  await expect(cartLink(page)).toBeInViewport();

  await cartLink(page).tap();
  await expect(cartLines(page)).toHaveCount(2);
  expect(await noHorizontalScroll()).toBe(true);
  // 2 × 39,00 + 189,00
  await expect(total(page)).toHaveText(euro('267,00'));

  await page.getByRole('button', { name: 'Suurenda toote Vikerkaar Junior kogust' }).tap();
  await expect(total(page)).toHaveText(euro('306,00'));
  await page.getByRole('button', { name: 'Vähenda toote Vikerkaar Junior kogust' }).tap();
  await page.getByRole('button', { name: 'Vähenda toote Vikerkaar Junior kogust' }).tap();
  await expect(total(page)).toHaveText(euro('228,00'));
  await page.getByRole('button', { name: 'Eemalda toode Põhjala ANC' }).tap();
  await expect(total(page)).toHaveText(euro('39,00'));
  await page.getByRole('button', { name: 'Eemalda toode Vikerkaar Junior' }).tap();
  await expect(page.getByText('Sinu ostukorv on tühi.')).toBeVisible();
});


test.describe('avaleht ilma toodete otsinguta', () => {
  const cardNames = (page: Page) => page.locator('.product-card h2');

  test('avalehel pole otsinguvälja ja kõik tooted on nähtavad', async ({ page }) => {
    await page.goto('/');
    await expect(cardNames(page)).toHaveCount(6);
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.getByRole('search')).toHaveCount(0);
    await expect(page.getByLabel('Otsi toodet')).toHaveCount(0);
    await expect(page.getByText('Tooteid ei leitud')).toHaveCount(0);
  });

  test('Tab viib pealkirjalt otse esimese toote lisamisnupule', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Klaviatuurivoog on mõeldud lauaarvutile');
    await page.goto('/');
    await page.getByRole('heading', { level: 1 }).focus();
    await page.keyboard.press('Tab');
    await expect(addButton(page, 'Põhjala ANC')).toBeFocused();
  });

  test('telefonis pole avalehel rõhtset kerimist', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Ainult mobiiliprojektis');
    await page.goto('/');
    await expect(cardNames(page)).toHaveCount(6);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    ).toBe(true);
  });
});
