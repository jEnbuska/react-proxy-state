import change from '../src';

describe('arrays', () => {
    test('sub state should stay as array', () => {
        const subject = change({a: [1, 2, 3]});
        expect(subject.state).toEqual({a: [1, 2, 3]});
        expect(subject.a.state[0]).toEqual(1);
    });

    test('remove from array in arbitrary order', () => {
        const {child} = change({child: [{a: 1}, {b: 2}, {c: 3}, {d: 4}, {e: 5}, {f: 6}, {g: 7}, {h: 8}]});
        child.remove(3, 1, 0, 7);
        expect(child.state).toEqual([{c: 3}, {e: 5}, {f: 6}, {g: 7}]);
        expect(child[0].state).toEqual({c: 3});
        expect(child[1].state).toEqual({e: 5});
        expect(child[2].state).toEqual({f: 6});
        expect(child[3].state).toEqual({g: 7});
        expect(child[4]).toEqual(undefined);
        expect(child[5]).toEqual(undefined);
        expect(child[6]).toEqual(undefined);
        expect(child[7]).toEqual(undefined);
    });

    test('remove pre accessed children from array in arbitrary order', () => {
        const {child} = change({child: [{a: 1}, {b: 2}, {c: 3}, {d: 4}, {e: 5}, {f: 6}, {g: 7}, {h: 8}]});
        for (let i = 0; i < 8; i++) {
            expect(child[i]).toBeDefined();
        }
        child.remove(3, 1, 0, 7);
        expect(child.state).toEqual([{c: 3}, {e: 5}, {f: 6}, {g: 7}]);
        expect(child[0].state).toEqual({c: 3});
        expect(child[1].state).toEqual({e: 5});
        expect(child[2].state).toEqual({f: 6});
        expect(child[3].state).toEqual({g: 7});
        expect(child[4]).toEqual(undefined);
        expect(child[5]).toEqual(undefined);
        expect(child[6]).toEqual(undefined);
        expect(child[7]).toEqual(undefined);
    });

    test('remove from array in arbitrary order, preAccessed children', () => {
        const {child} = change({child: [{a: 1}, {b: 2}, {c: 3}, {d: 4}, {e: 5}, {f: 6}, {g: 7}, {h: 8}]});
        child.remove(3, 1, 0, 7);
        expect(child.state).toEqual([{c: 3}, {e: 5}, {f: 6}, {g: 7}]);
        expect(child[0].state).toEqual({c: 3});
        expect(child[1].state).toEqual({e: 5});
        expect(child[2].state).toEqual({f: 6});
        expect(child[3].state).toEqual({g: 7});
        expect(child[4]).toEqual(undefined);
        expect(child[5]).toEqual(undefined);
        expect(child[6]).toEqual(undefined);
        expect(child[7]).toEqual(undefined);
    });

    test('should replace current array sub state with a array', () => {
        const subject = change({child: {a: [1, 2, {b: 2}]}});
        const {child} = subject;
        expect(child.state).toEqual({a: [1, 2, {b: 2}]});
        subject.child = ({a: ['abc', {test: 'empty'}, 2, 3, 4]});
        expect(child.state).toEqual({a: ['abc', {test: 'empty'}, 2, 3, 4]});
        expect(child.a[1].state.test).toEqual('empty');
        subject.child = ({a: [1, 2, []]});
        expect(child.state).toEqual({a: [1, 2, []]});
        expect(child.a.state).toEqual([1, 2, []]);
    });

    test('calling set state to array state should erase old array', () => {
        const subject = change({child: []});
        const {child} = subject;
        subject.child = ([1, 2, {b: 2}]);
        expect(child.state).toEqual([1, 2, {b: 2}]);
        subject.child = (['abc', {test: 'empty'}, 2, 3, 4]);
        expect(child.state).toEqual(['abc', {test: 'empty'}, 2, 3, 4]);
        subject.child = ([1, 2, []]);
        expect(child.state).toEqual([1, 2, []]);
    });

    test('kill old references', () => {
        const subject = change({child: ['abc', 1, {test: 'empty'}, {toBeRmd: 0}, 3, 4]});
        const {child} = subject;
        expect(child.state).toEqual(['abc', 1, {test: 'empty'}, {toBeRmd: 0}, 3, 4]);
        subject.child = ([1, 2, []]);
        expect(child.state).toEqual([1, 2, []]);
        expect(child[3]).toEqual(undefined);
    });

    test('array to object should not merge', () => {
        const subject = change({child: [{a: 1}, {b: 2}, {c: 3}]});
        const {child} = subject;
        expect(child.state).toEqual([{a: 1}, {b: 2}, {c: 3}]);
        subject.child = ({0: {a: 1}, obj: {test: 'empty'}, 2: '1b', x: 3});
        expect(child.state).toEqual({0: {a: 1}, obj: {test: 'empty'}, 2: '1b', x: 3});
    });

    test('object to array should not merge', () => {
        const subject = change({child: {0: 1, 1: {b: 2}, 2: {c: 3}}});
        const {child} = subject;
        expect(child.state).toEqual({0: 1, 1: {b: 2}, 2: {c: 3}});
        subject.child = ([3, 2]);
        expect(child.state).toEqual([3, 2]);
    });

    test('array to array should not merge', () => {
        const subject = change({child: [1, {a: 1}, 3, 4]});
        const {child} = subject;
        expect(child.state).toEqual([1, {a: 1}, 3, 4]);
        subject.child = ([{x: 2}, 2]);
        expect(child.state).toEqual([{x: 2}, 2]);
    });

    test('removing from array', () => {
        const {child} = change({child: [{a: 1}, {b: 2}, {c: 3}, 3, 4, 5, 6]});
        child.remove(0, 2, 6);
        expect(child.state).toEqual([{b: 2}, 3, 4, 5]);
        expect(child.state[0]).toEqual({b: 2});
        expect(child.state[1]).toEqual(3);
        expect(child.state[2]).toEqual(4);
        expect(child.state[3]).toEqual(5);
    });

    test('array state should shift', () => {
        const {child} = change({child: [0, 1, {toBeRemoved: 2}, 3, {toBeKept: 4}, 5, 6]});
        const third = child[2];
        child.remove(2);
        expect(child.state).toEqual([0, 1, 3, {toBeKept: 4}, 5, 6]);
        expect(third.state).toEqual(undefined);
        expect(child.state[2]).toEqual(3);
        expect(child[3].state).toEqual({toBeKept: 4});
    });

    test('changing children of array', () => {
        const subject = change([{a: {b: 2}}, 1]);
        subject[0].a.assign({b: 100});
        expect(subject.state).toEqual([{a: {b: 100}}, 1]);
    });

    test('leaf state to array', () => {
        {
            const subject = change({child: {val: null}});
            expect(subject.state.child.val).toEqual(null);
            subject.child = ([1, 2, {a: 3}]);
            expect(subject.child.state).toEqual([1, 2, {a: 3}]);
        }
        {
            const subject = change({child: {s: 0}});
            expect(subject.state.child.s).toEqual(0);
            subject.child.assign({s: [1, 2, {a: 3}]});
            expect(subject.child.s.state).toEqual([1, 2, {a: 3}]);
        }
        {
            const subject = change({s: /test/});
            expect(subject.state.s.toString()).toEqual('/test/');
            subject.assign({s: [1, 2, {a: 3}]});
            expect(subject.s.state).toEqual([1, 2, {a: 3}]);
        }
        {
            const symbol = Symbol('test');
            const subject = change({s: symbol});
            expect(subject.state.s).toEqual(symbol);
            subject.assign({s: [1, 2, {a: 3}]});
            expect(subject.s.state).toEqual([1, 2, {a: 3}]);
        }
    });

    test('array to leaf',
        () => {
            {
                const subject = change({content: [1, 2, {a: 3}]});
                expect(subject.state).toEqual({content: [1, 2, {a: 3}]});
                subject.assign({content: null});
                expect(subject.state.content).toEqual(null);
            }
            {
                const subject = change({content: [1, 2, {a: 3}]});
                expect(subject.state).toEqual({content: [1, 2, {a: 3}]});
                subject.assign({content: 0});
                expect(subject.state.content).toEqual(0);
            }
            {
                const subject = change({content: [1, 2, {a: 3}]});
                expect(subject.state).toEqual({content: [1, 2, {a: 3}]});
                subject.assign({content: /test/});
                expect(subject.state.content.toString()).toEqual('/test/');
            }
            {
                const subject = change({content: [1, 2, {a: 3}]});

                expect(subject.state).toEqual({content: [1, 2, {a: 3}]});
                const symbol = Symbol('test');
                subject.assign({content: symbol});
                expect(subject.state.content).toEqual(symbol);
            }
        });

    test('shift array values', () => {
        const subject = change({child: [{a: 1}, {b: 2}, {c: 3}]});
        const {child} = subject;
        expect(child.state).toEqual([{a: 1}, {b: 2}, {c: 3}]);
        const {0: a, 1: b, 2: c} = child;
        subject.child = ([{c: 3}, {a: 1}, {b: 2}]);
        expect(a.state).toEqual({c: 3});
        expect(b.state).toEqual({a: 1});
        expect(c.state).toEqual({b: 2});
        // This is unintuitive. Creating new subjects every time subject gets changed brings it's own challenges
    });
});
