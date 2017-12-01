import Identity from '../src/immutability/Identity';
import {identityPrivates} from '../src/common';

const {RESOLVE_LOCATION, ADD, REMOVE_CHILD} = identityPrivates;

describe('Identity', () => {
    test('Ensure identity integrity', () => {
        const tree = new Identity();
        expect(tree[RESOLVE_LOCATION]()).toEqual([]);
        const a = tree[ADD]('a');
        expect(a[RESOLVE_LOCATION]()).toEqual(['a']);
        const b = a[ADD]('b');
        expect(b[RESOLVE_LOCATION]()).toEqual(['b', 'a']);
        const c = b[ADD]('c');
        expect(c[RESOLVE_LOCATION]()).toEqual(['c', 'b', 'a']);

        const x = b[ADD]('x');
        expect(x[RESOLVE_LOCATION]()).toEqual(['x', 'b', 'a']);
        expect(c[RESOLVE_LOCATION]()).toEqual(['c', 'b', 'a']);
        expect(b[RESOLVE_LOCATION]()).toEqual(['b', 'a']);
        expect(a[RESOLVE_LOCATION]()).toEqual(['a']);
        const y = x[ADD]('y');
        const z = x[ADD]('z');
        expect(y[RESOLVE_LOCATION]()).toEqual(['y', 'x', 'b', 'a']);
        expect(z[RESOLVE_LOCATION]()).toEqual(['z', 'x', 'b', 'a']);
        const i = z[ADD]('i');
        const j = z[ADD]('j');
        const k = j[ADD]('k');
        expect(i[RESOLVE_LOCATION]()).toEqual(['i', 'z', 'x', 'b', 'a']);
        expect(j[RESOLVE_LOCATION]()).toEqual(['j', 'z', 'x', 'b', 'a']);
        expect(k[RESOLVE_LOCATION]()).toEqual(['k', 'j', 'z', 'x', 'b', 'a']);

        b[REMOVE_CHILD]('x');

        expect(i[RESOLVE_LOCATION]()).toBeUndefined();
        expect(j[RESOLVE_LOCATION]()).toBeUndefined();
        expect(k[RESOLVE_LOCATION]()).toBeUndefined();

        expect(z[RESOLVE_LOCATION]()).toBeUndefined();
        expect(y[RESOLVE_LOCATION]()).toBeUndefined();

        expect(x[RESOLVE_LOCATION]()).toBeUndefined();
    });
});