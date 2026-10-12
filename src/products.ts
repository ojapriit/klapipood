export interface Product {
  id: string;
  name: string;
  description: string;
  /** Hind sentides, et vältida ujukomavigu. */
  priceCents: number;
  image: string;
  imageAlt: string;
}

export const products: Product[] = [
  {
    id: 'pohjala',
    name: 'Põhjala ANC',
    description: 'Suletud kõrvapealsed mürasummutusega klapid pikkadeks rongisõitudeks. Aku kestab kuni 40 tundi.',
    priceCents: 18900,
    image: '/images/pohjala.svg',
    imageAlt: 'Tumerohelised kõrvapealsed kõrvaklapid',
  },
  {
    id: 'sadu',
    name: 'Sadu Pods',
    description: 'Kerged juhtmevabad nööpkõrvaklapid koos laadimiskarbiga. Vihmakindlad ja taskusse mahtuvad.',
    priceCents: 7900,
    image: '/images/sadu.svg',
    imageAlt: 'Valged juhtmevabad nööpkõrvaklapid laadimiskarbi kohal',
  },
  {
    id: 'studio',
    name: 'Stuudio 7',
    description: 'Neutraalse heliga monitoorklapid salvestamiseks ja miksimiseks. Vahetatav juhe ja pehmed padjad.',
    priceCents: 14500,
    image: '/images/studio.svg',
    imageAlt: 'Pruunid stuudio-kõrvaklapid oranžide detailidega',
  },
  {
    id: 'joosk',
    name: 'Jooks Sport',
    description: 'Kaelavõruga spordiklapid, mis püsivad paigal ka metsarajal. Higikindlad ja helkuritega.',
    priceCents: 5900,
    image: '/images/joosk.svg',
    imageAlt: 'Rohelised kaelavõruga spordikõrvaklapid',
  },
  {
    id: 'laine',
    name: 'Laine Bluetooth',
    description: 'Mugavad igapäevaklapid kokkupandava raamiga. Kaks seadet korraga ühendatud.',
    priceCents: 9900,
    image: '/images/laine.svg',
    imageAlt: 'Sinised kokkupandavad Bluetooth-kõrvaklapid',
  },
  {
    id: 'vikerkaar',
    name: 'Vikerkaar Junior',
    description: 'Värvilised lasteklapid helitugevuse piirajaga 85 dB. Painduv ja vastupidav peavõru.',
    priceCents: 3900,
    image: '/images/vikerkaar.svg',
    imageAlt: 'Värvilised lastekõrvaklapid punase peavõruga',
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));

const euroFormat = new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' });

export function formatPrice(cents: number): string {
  return euroFormat.format(cents / 100);
}
