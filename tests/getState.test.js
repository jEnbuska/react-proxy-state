import change from '../src';

describe('getState', () => {
    test('get primitive state', () => {
        const subject = change({a: 1});
        expect(subject.a.state).toBe(1);
    });

    test('get previously primitive value proxy after removed', () => {
        const subject = change({a: 1});
        subject.remove('a');
        expect(subject.a).toBeUndefined();
    });

    test('get object state', () => {
        const subject = change({a: {b: 1}});
        expect(subject.a.state).toEqual({b: 1});
    });

    test('get nested state', () => {
        const subject = change({a: {b: 1}});
        expect(subject.a.b.state).toEqual(1);
    });
});
