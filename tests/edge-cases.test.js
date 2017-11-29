import create from '../src';

describe('edge cases', () => {
    test('bad keys', () => {
        expect(0 in {"0": undefined}).toBe(true);
        expect("0" in {0: undefined}).toBe(true)
        expect(undefined in {[undefined]: undefined}).toBe(true)
    });

    test('assign to undefined', () => {
        const subject = create({a:undefined});
        subject.a.assign({b:2})
        expect(subject.a.state).toEqual({b:2})

    });

});