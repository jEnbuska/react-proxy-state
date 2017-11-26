import change from '../src';

describe('Create subject', () => {
    test('should be able to reference children', () => {
        const subject = change({b: {c: 2, d: 3, e: {f: 4}}});
        const {state} = subject.b.e;
    });

    test('should return 2 level initial values', () => {
        const subject = change({b: {c: 1}});
        expect(subject.state).toEqual({b: {c: 1}});
    });

    test('should return 3 level initial values', () => {
        const subject = change({b: {c: 2, d: 3, e: {f: 4}}});
        expect(subject.state).toEqual({b: {c: 2, d: 3, e: {f: 4}}});
    });
});
