import change from '../src';

function verifyErrorOnChange(...params) {
    params.forEach(next => {
        expect(() => next.assign(1)).toThrow(Error);
        expect(() => next.assign({x: 100})).toThrow(Error);
        expect(() => next.clear(1)).toThrow(Error);
        expect(() => next.clear({x: 100})).toThrow(Error);
        expect(() => next.remove('b')).toThrow(Error);
    });
}

describe('exception', () => {
    test('changing removed child subject should throw an exception',
        () => {
            const {child} = change({child: {a: {val: 1}, b: 2, c: {d: {e: 3}}}});
            const {a, c} = child;
            const {d} = c;
            child.remove('a');
            child.remove('c');
            verifyErrorOnChange(a, c, d);
        });

    test('accessing remove sub subject should throw an exception', () => {
        const {child} = change({child: {a: {b: 1}, b: {val: 2}, c: {d: {val: 3}}}});
        const {a, b, c} = child;
        const {d} = c;
        child.remove('a', 'b', 'c');
        expect(() => a.assign({})).toThrow(Error);
        expect(() => b.assign({})).toThrow(Error);
        expect(() => c.assign({})).toThrow(Error);
        expect(() => a.clear({})).toThrow(Error);
        expect(() => b.clear({})).toThrow(Error);
        expect(() => c.clear({})).toThrow(Error);

        expect(() => a.remove('b')).toThrow(Error);
        expect(() => b.remove('val')).toThrow(Error);
        expect(() => c.remove('d')).toThrow(Error);
        expect(() => d.remove('val')).toThrow(Error);
    });
});