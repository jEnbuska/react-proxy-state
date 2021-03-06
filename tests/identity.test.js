import Identity from '../src/immutability/Identity';
import {identityPrivates} from '../src/common';

const {RESOLVE_LOCATION, ADD, REMOVE_CHILD} = identityPrivates;

describe('Identity', () => {
    test('Ensure identity integrity', () => {
        const tree = new Identity(undefined, undefined, 0);
        expect(tree[RESOLVE_LOCATION]()).toEqual([]);
        const a = tree[ADD]('a');
        expect(a[RESOLVE_LOCATION]()).toEqual(['a']);
        const b = a[ADD]('b');
        expect(b[RESOLVE_LOCATION]()).toEqual(['a', 'b']);
        const c = b[ADD]('c');
        expect(c[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'c']);

        const x = b[ADD]('x');
        expect(x[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'x',]);
        expect(c[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'c',]);
        expect(b[RESOLVE_LOCATION]()).toEqual(['a', 'b']);
        expect(a[RESOLVE_LOCATION]()).toEqual(['a']);
        const y = x[ADD]('y');
        const z = x[ADD]('z');
        expect(y[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'x', 'y']);
        expect(z[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'x', 'z']);
        const i = z[ADD]('i');
        const j = z[ADD]('j');
        const k = j[ADD]('k');
        expect(i[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'x', 'z', 'i']);
        expect(j[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'x', 'z', 'j']);
        expect(k[RESOLVE_LOCATION]()).toEqual(['a', 'b', 'x', 'z', 'j', 'k']);

        b[REMOVE_CHILD]('x');

        expect(i[RESOLVE_LOCATION]()).toBeUndefined();
        expect(j[RESOLVE_LOCATION]()).toBeUndefined();
        expect(k[RESOLVE_LOCATION]()).toBeUndefined();

        expect(z[RESOLVE_LOCATION]()).toBeUndefined();
        expect(y[RESOLVE_LOCATION]()).toBeUndefined();

        expect(x[RESOLVE_LOCATION]()).toBeUndefined();
    });
});