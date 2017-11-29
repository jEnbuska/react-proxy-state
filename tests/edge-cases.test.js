import create from '../src';

describe('edge cases', () => {
    test('bad keys', () => {
        expect(0 in {"0": undefined}).toBe(true);
        expect("0" in {0: undefined}).toBe(true)
        expect(undefined in {[undefined]: undefined}).toBe(true)
    });

    test('undefined child', () => {
        const subject = create({a: undefined});
        expect(subject.a).toBeUndefined()
    });
});