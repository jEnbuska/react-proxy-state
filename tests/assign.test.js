import change from '../src';

describe('assign', () => {
    test('change root state', () => {
        const subject = change({a: 1});
        expect(subject.state).toEqual({a: 1});
        subject.assign({a: 2});
        expect(subject.state).toEqual({a: 2});
    });

    test('add a new values', () => {
        const {child} = change({child: {a: 1, b: {c: 2, d: 3, e: {f: 4}}}});
        child.assign({x: 1});
        expect(child.state).toEqual({a: 1, b: {c: 2, d: 3, e: {f: 4}}, x: 1});
    });

    test('leaf value to undefined', () => {
        const subject = change({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7}}});
        subject.b.assign({c: undefined});
        expect(subject.state).toEqual({a: 1, b: {c: undefined, d: 3, e: {f: 4, g: 7}}});
    });
    test('set leaf value to null', () => {
        const subject = change({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7}}});
        subject.b.assign({c: null});
        expect(subject.state).toEqual({a: 1, b: {c: null, d: 3, e: {f: 4, g: 7}}});
    });
    test('leaf into empty object', () => {
        const subject = change({child: {}});
        subject.child.assign({a: 1});
        subject.child.assign({a: {}});
        expect(subject.child.state).toEqual({a: {}});
    });
    test('leaf into object', () => {
        const subject = change({child: {}});
        subject.child.assign({a: 1, b: {c: 2, d: 3, e: 1}});
        subject.child.b.assign({e: {x: 2}});
        expect(subject.child.state).toEqual({a: 1, b: {c: 2, d: 3, e: {x: 2}}});
    });
    test('undefined leaf to object', () => {
        const {child} = change({child: {a: 1, b: 'hello', c: {d: undefined}}});
        child.c.assign({d: {x: {y: 13}}});
        expect(child.state).toEqual({a: 1, b: 'hello', c: {d: {x: {y: 13}}}});
    });
    test('null  leaf into object', () => {
        const {child} = change({child: {}});
        child.assign({1: 1, b: {c: 2, d: 3, e: null}});
        child.b.assign({e: {x: 2}});
        expect(child.state).toEqual({1: 1, b: {c: 2, d: 3, e: {x: 2}}});
        expect(child.state[1]).toEqual(1);
    });

    test('undefined leaf to string', () => {
        const {child} = change({
            child: {
                a: 1,
                b: {c: undefined, d: 3, e: {f: 4, g: 7, h: {i: 100, x: {}}}},
            },
        });
        child.assign({b: {c: 'Hello test'}});
        expect(child.state).toEqual({
            a: 1,
            b: {c: 'Hello test'},
        });
    });

    test('immidiate string to empty object', () => {
        const subject = change({child: {a: 'hello', b: {c: undefined, d: 3, e: {f: 4}}}});
        subject.child.assign({a: {}});
        expect(subject.child.state).toEqual({a: {}, b: {c: undefined, d: 3, e: {f: 4}}});
    });

    test('immidiate string to non empty object', () => {
        const {child} = change({child: {a: 'hello', b: {c: undefined, d: 3, e: {f: 4}}}});
        child.assign({a: {b: 'world'}});
        expect(child.state).toEqual({a: {b: 'world'}, b: {c: undefined, d: 3, e: {f: 4}}});
    });

    test('non immidiate string to empty object', () => {
        const subject = change({b: {c: 'hello', d: 3, e: {f: 4}}});
        subject.assign({b: {c: {}}});
        expect(subject.state).toEqual({b: {c: {}}});
    });

    test('non immidiate string to non empty object', () => {
        const subject = change({b: {c: 'hello', d: 3, e: {f: 4}}});
        subject.assign({b: {c: {x: 1, y: 'test'}}});
        expect(subject.state).toEqual({b: {c: {x: 1, y: 'test'}}});
    });
});
