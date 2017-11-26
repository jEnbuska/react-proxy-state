import change from '../src';

describe('imperative-assignment', () => {
    test('imperative-assign object state to object state', () => {
        const subject = change({val: 1});
        subject.val = {a: 1};
        expect(subject.val.state).toEqual({a: 1});
        expect(subject.state).toEqual(({val: {a: 1}}));
    });

    test('imperative-assign primitive state', () => {
        const subject = change({val: 1});
        subject.val = 2;
        expect(subject.val.state).toEqual(2);
        expect(subject.state).toEqual({val: 2});
    });

    test('imperative-assign object state to primitive', () => {
        const subject = change({val: {a: 1}});
        subject.val = 2;
        expect(subject.val.state).toEqual(2);
        expect(subject.state).toEqual({val: 2});
    });

    test('imperative-assign primitive state to object', () => {
        const subject = change({val: 1});
        subject.val = {a: 1};
        expect(subject.val.state).toEqual({a: 1});
        expect(subject.state).toEqual({val: {a: 1}});
    });

    test('imperative-assign none to object state', () => {
        const subject = change({a: 1});
        subject.b = {c: 2};
        expect(subject.b.c.state).toEqual(2);
        expect(subject.b.state).toEqual({c: 2});
        expect(subject.state).toEqual({a: 1, b: {c: 2}});
    });
});