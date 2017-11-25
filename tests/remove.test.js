import change from '../src';

describe('remove', () => {

    test('removing leaf from object', () => {
        const subject = change({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, x: {t: -1}, j: {z: -0}}}}});
        subject.b.remove('d');
        expect(subject.state).toEqual({a: 1, b: {c: 2, e: {f: 4, g: 7, h: {i: 100, x: {t: -1}, j: {z: -0}}}}});
    });

    test('remove sub object', () => {
        const subject = change({
            child: {
                a: 1,
                b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, x: {t: -1}, j: {z: -0}}}},
            },
        });
        subject.child.b.e.h.remove('x');
        expect(subject.state).toEqual({child: {a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, j: {z: -0}}}}}});
        subject.child.b.remove('d');
        subject.child.remove('b');
        expect(subject.state).toEqual({child: {a: 1}});
    });

    test('should be able to remove an empty child', () => {
        const subject = change({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, x: {}, j: {z: -0}}}}});
        subject.b.e.h.remove('x');
        expect(subject.state).toEqual({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, j: {z: -0}}}}});
    });

    test('should be able to remove undefined value', () => {
        const subject = change({a: 1, b: {c: undefined, d: undefined, e: {f: 4, g: 7}}});
        subject.b.remove('d');
        expect(subject.state).toEqual({a: 1, b: {c: undefined, e: {f: 4, g: 7}}});
    });

    test('should be able to remove multiple children at ones', () => {
        const subject = change({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, x: {}, j: {z: -0}}}}});
        subject.b.e.h.remove('x', 'j');
        expect(subject.state).toEqual({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100}}}});
    });

    test('should be able to remove multiple children little by little', () => {
        const subject = change({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, x: {t: -1}, j: {z: -0}}}}});
        subject.b.e.h.remove('x');
        expect(subject.state).toEqual({a: 1, b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, j: {z: -0}}}}});
        subject.b.e.remove('h');
        subject.b.remove('e');
        expect(subject.state).toEqual({a: 1, b: {c: 2, d: 3}});
    });

    test('sub subject should be removed', () => {
        const subject = change({
            child: {
                a: 1,
                b: {c: 2, d: 3, e: {f: 4, g: 7, h: {i: 100, x: {t: -1}, j: {z: -0}}}},
            },
        });
        subject.child.remove('b');
        expect(subject.b).toEqual(undefined);
        expect(subject.child.state.b).toEqual(undefined);
    });
});