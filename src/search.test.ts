import { describe, expect, it } from 'vitest';
import { products } from './products';
import { filterProductsByName } from './search';

const names = (query: string) => filterProductsByName(products, query).map((p) => p.name);

describe('filterProductsByName', () => {
  it('leiab toote nime järgi', () => {
    expect(names('Sadu Pods')).toEqual(['Sadu Pods']);
  });

  it('ei erista suuri ja väikseid tähti', () => {
    expect(names('sadu')).toEqual(['Sadu Pods']);
    expect(names('SADU')).toEqual(['Sadu Pods']);
    expect(names('sAdU pOdS')).toEqual(['Sadu Pods']);
  });

  it('ei erista suuri ja väikseid täpitähti', () => {
    expect(names('PÕHJALA')).toEqual(['Põhjala ANC']);
    expect(names('põhjala anc')).toEqual(['Põhjala ANC']);
  });

  it('leiab nime osa järgi', () => {
    expect(names('pod')).toEqual(['Sadu Pods']);
    expect(names('stuudio')).toEqual(['Stuudio 7']);
  });

  it('otsib ainult nimest, mitte kirjeldusest', () => {
    // „rongisõitudeks” on Põhjala ANC kirjelduses, mitte nimes.
    expect(names('rongisõitudeks')).toEqual([]);
  });

  it('tühi või tühikutega otsing tagastab kõik tooted samas järjekorras', () => {
    expect(names('')).toEqual(products.map((p) => p.name));
    expect(names('   ')).toEqual(products.map((p) => p.name));
  });

  it('eemaldab otsingusõna eest ja tagant tühikud', () => {
    expect(names('  sadu  ')).toEqual(['Sadu Pods']);
  });

  it('tagastab tühja loendi, kui vasteid pole', () => {
    expect(names('xyz')).toEqual([]);
  });

  it('ei muuda algset loendit', () => {
    const before = products.map((p) => p.id);
    filterProductsByName(products, 'sadu');
    expect(products.map((p) => p.id)).toEqual(before);
  });
});
