import change from '../src';

describe('toggle', () => {
    test('toggle boolean', () => {
        const subject = change({a: true, b: 2});
        subject.a.toggle();
        expect(subject.state).toEqual({a: false, b: 2});
        expect(subject.a.state).toEqual(false);
        subject.a.toggle();
        expect(subject.state).toEqual({a: true, b: 2});
        expect(subject.a.state).toEqual(true);
    });

    test('toggle object', () => {
        const subject = change({a: {}, b: 2});
        subject.a.toggle();
        expect(subject.state).toEqual({a: false, b: 2});
        expect(subject.a.state).toEqual(false);
    });

    test('toggle positive number', () => {
        const subject = change({a: 1, b: 2});
        subject.a.toggle();
        expect(subject.state).toEqual({a: false, b: 2});
        expect(subject.a.state).toEqual(false);
    });

    test('toggle zero number', () => {
        const subject = change({a: 0, b: 2});
        subject.a.toggle();
        expect(subject.state).toEqual({a: true, b: 2});
        expect(subject.a.state).toEqual(true);
        subject.a.toggle();
        expect(subject.state).toEqual({a: false, b: 2});
        expect(subject.a.state).toEqual(false);
    });
});
