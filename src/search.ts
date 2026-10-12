import type { Product } from './products';

/** Eesti lokaadiga väiketähed, et ka Õ, Ä, Ö, Ü ja Š, Ž võrdleksid õigesti. */
const normalize = (text: string) => text.trim().toLocaleLowerCase('et');

/**
 * Filtreerib tooted nime järgi. Suur- ja väiketähti ei eristata; otsingusõna võib olla nime osa.
 * Tühi (või ainult tühikutest koosnev) otsing tagastab kõik tooted.
 */
export function filterProductsByName<T extends Pick<Product, 'name'>>(products: readonly T[], query: string): T[] {
  const q = normalize(query);
  if (!q) return [...products];
  return products.filter((p) => normalize(p.name).includes(q));
}
