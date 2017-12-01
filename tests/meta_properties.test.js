import change from '../src';
import Branch from '../src/immutability/Branch';

describe('meta properties', () => {
    test('string concat', () => {
        const subject = change({a: true, b: 2});
        expect(subject + '').toBe('[object Branch]');
    });

    test('toggle should fail', () => {
        const subject = change({a: true, b: 2});
        subject.a = !subject.a;
        expect(subject.a.state).toBe(false);
        subject.a = !subject.a;
        expect(subject.a.state).toBe(false);
    });

    test('toString', () => {
        const subject = change({a: true, b: 2});
        expect(subject.toString()).toBe('[object Branch]');
    });
    test('stringify', () => {
        const subject = change({a: 2, b: 3});
        expect(JSON.stringify(subject, null, 2)).toBe(JSON.stringify(subject.state, null, 2));
    });

    test('plus plus', () => {
        const subject = change({a: 1, b: 2});
        const {state: prevState} = subject;
        subject.a++;
        expect(prevState).toEqual({a: 1, b: 2});
        expect(subject.state).toEqual({a: 2, b: 2});
        expect(subject.a.state).toEqual(2);
    });

    test('pre plus plus', () => {
        const subject = change({a: 1, b: 2});
        const {state: prevState} = subject;
        ++subject.a;
        expect(prevState).toEqual({a: 1, b: 2});
        expect(subject.state).toEqual({a: 2, b: 2});
        expect(subject.a.state).toEqual(2);
    });

    test('minus  minus', () => {
        const subject = change({a: 1, b: 2});
        const {state: prevState} = subject;
        subject.a--;
        expect(prevState).toEqual({a: 1, b: 2});
        expect(subject.state).toEqual({a: 0, b: 2});
        expect(subject.a.state).toEqual(0);
    });

    test('pre minus  minus', () => {
        const subject = change({a: 1, b: 2});
        const {state: prevState} = subject;
        --subject.a;
        expect(prevState).toEqual({a: 1, b: 2});
        expect(subject.state).toEqual({a: 0, b: 2});
        expect(subject.a.state).toEqual(0);
    });

    test('comparison of proxys representing same instance should not fail', () => {
        const subject = change({a: {}});
        expect(subject.a === subject.a).toBeTruthy();
    });

    test('addition using proxies', () => {
        const subject = change({a: 2, b: 3});
        subject.c = 2;
        expect(subject.c.state).toBe(2);
        subject.a = subject.b + subject.c;
        expect(subject.a.state).toBe(5);
        subject.c++;
        expect(subject.b === subject.c).toBe(false)
    });

    test('get object keys', () => {
        const subject = change({a: 2, b: 3});
        expect(Object.keys(subject)).toEqual(['a', 'b']);
        subject.remove('a');
        expect(Object.keys(subject)).toEqual(['b']);
    });

    test('get object values', () => {
        const subject = change({a: 2, b: 3});
        expect(Object.values(subject).map(it => it.state)).toEqual([2, 3]);
        subject.remove('a');
        expect(Object.values(subject).map(it => it.state)).toEqual([3]);
    });

    test('instanceof', () => {
        expect(change({}) instanceof Branch).toBe(true)
    });

    test('assign Branch to Branch', () => {
        const subject = change({a: {}, b: {}});
        subject.a = subject.b;
        expect(subject.a.state).toBe(subject.b.state);
        subject.a.assign({x: 1});
        expect(subject.a.state).toEqual({x: 1});
        expect(subject.b.state).toEqual({});
        expect(subject.state).toEqual({a: {x: 1}, b: {}});
    })

    test('destruct', () => {
        const subject = change({a: {}, b: {c: [1, 2, 3]}, d: 1});
        const {d, ...vals} = subject;
        expect(Object.entries(vals).map(([k, v]) => [k, v.state])).toEqual([['a', {}], ['b', {c: [1, 2, 3]}]])
        expect(d.state).toBe(1);
    });

    test('spread', () => {
        const subject = change({a: {}, b: {c: [1, 2, {}]}, d: 1});
        const [first, ...arr] = subject.b.c;
        expect(first.state).toBe(1);
        expect(arr.map(it => it.state)).toEqual([2, {}]);
    })

    test('has', () => {
        const subject = change({a: {}});
        expect('a' in subject).toBe(true);
        expect('b' in subject).toBe(false);
    });

    test('log should not throw error', () => {
        console.log(change({a:{}}));
    })
});
