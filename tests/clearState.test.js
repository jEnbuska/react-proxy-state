import change from '../src';

describe('onClearState', () => {
    describe('run ' + name + ' configuration', () => {
        test('clearing state', () => {
            const bPart = {b: {c: 2, x: {y: 12}}};
            const {child} = change({child: {a: {}, ...bPart, d: {e: {f: 5}}, g: {h: 11}}});
            const {state} = child.clear({a: 11, ...bPart, g: {h: 12, i: {}}, j: {}});
            expect(state).toEqual({a: 11, b: {c: 2, x: {y: 12}}, g: {h: 12, i: {}}, j: {}});
        });
    });
});
