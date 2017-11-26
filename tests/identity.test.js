import Identity from '../src/immutability/Identity';
import {identityPrivates} from '../src/common';

const {RESOLVE, PUSH, REMOVE_CHILD} = identityPrivates;

describe('Identity', () => {
    test('Ensure identity integrity', () => {
        const tree = new Identity();
        expect(tree[RESOLVE]()).toEqual([]);
        const a = tree[PUSH]('a');
        expect(a[RESOLVE]()).toEqual(['a']);
        const b = a[PUSH]('b');
        expect(b[RESOLVE]()).toEqual(['b', 'a']);
        const c = b[PUSH]('c');
        expect(c[RESOLVE]()).toEqual(['c', 'b', 'a']);

        const x = b[PUSH]('x');
        expect(x[RESOLVE]()).toEqual(['x', 'b', 'a']);
        expect(c[RESOLVE]()).toEqual(['c', 'b', 'a']);
        expect(b[RESOLVE]()).toEqual(['b', 'a']);
        expect(a[RESOLVE]()).toEqual(['a']);
        const y = x[PUSH]('y');
        const z = x[PUSH]('z');
        expect(y[RESOLVE]()).toEqual(['y', 'x', 'b', 'a']);
        expect(z[RESOLVE]()).toEqual(['z', 'x', 'b', 'a']);
        const i = z[PUSH]('i');
        const j = z[PUSH]('j');
        const k = j[PUSH]('k');
        expect(i[RESOLVE]()).toEqual(['i', 'z', 'x', 'b', 'a']);
        expect(j[RESOLVE]()).toEqual(['j', 'z', 'x', 'b', 'a']);
        expect(k[RESOLVE]()).toEqual(['k', 'j', 'z', 'x', 'b', 'a']);

        b[REMOVE_CHILD]('x');

        expect(i[RESOLVE]()).toEqual(false);
        expect(j[RESOLVE]()).toEqual(false);
        expect(k[RESOLVE]()).toEqual(false);

        expect(z[RESOLVE]()).toEqual(false);
        expect(y[RESOLVE]()).toEqual(false);

        expect(x[RESOLVE]()).toEqual(false);
    });
});