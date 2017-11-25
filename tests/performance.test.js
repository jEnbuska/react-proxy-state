import change from '../src';
import {data, data2} from './resources';

const now = require('nano-time');

const {keys} = Object;
const results = {
    addAndRemove: {},
    createAndAccess: {},
    addRemoveAndInit: {},
    getState: {},
    removeWorst: {},
    removeSemi: {},
    create: {},
    createLeafs: {},
    clearState: {},
    clearAccessedState: {},
    getNewChildren: {},
    reduxComparison: {},
    access: {},
    assign: {},
    assignBetter: {},
    assignBetterBadCase: {},
    assignWithClearReferences: {},
};
describe('performance', () => {
    afterAll(() => console.log(JSON.stringify(results, null, 2)));

    test('mixed', () => {
        const even = data.companies;
        const odd = data2;
        const firstCompany = keys(even.companies)[0];
        const firstChildOdd = keys(odd)[0];
        const {child} = change({child: {}});
        child.assign(even);
        const time = new Date();
        for (let i = 0; i < 3000; i++) {
            if (i % 7 === 0) {
                child.clearState({});
            }
            if (i % 2 === 0) {
                child.clearState(even);
                child.companies[firstCompany].assign(odd[firstChildOdd]);
                child.companies.remove([firstCompany]);
            } else {
                child.clearState(odd);
                child[firstChildOdd].assign(even.companies[firstCompany]);
                child.remove([firstChildOdd]);
            }
        }
        results.addAndRemove[name] = (new Date() - time) / 3000;
        console.log(name + ' = ~ 3000 nodes merges, 3000 resets, 3000 removes Took total of: ', new Date() - time, 'ms');
    }, 15000);

    test('clearState', () => {
        const even = data;
        const odd = data2;
        const {child} = change({child: {}});
        const time = Date.now();
        for (let i = 0; i < 3000; i++) {
            if (i % 2 === 0) {
                child.clearState(even);
            } else {
                child.clearState(odd);
            }
        }
        results.clearState[name] = (new Date() - time) / 300;
    });

    test('mixed + init children', () => {
        const even = data;
        const odd = data2;
        const firstCompany = keys(even.companies)[0];
        const firstChildOdd = keys(odd)[0];
        const {child} = change({child: {}});
        child.assign(even);
        const time = new Date();
        for (let i = 0; i < 1500; i++) {
            if (i % 7 === 0) {
                child.clearState({});
            }
            if (i % 2 === 0) {
                Object.keys(child.clearState(even).state).map(k => child[k]);
                Object.keys(child.companies[firstCompany].assign(odd[firstChildOdd]).state).map(k => child[k]);
                child.companies.remove([firstCompany]);
            } else {
                Object.keys(child.clearState(odd).state).map(k => child[k]);
                Object.keys(child[firstChildOdd].assign(even.companies[firstCompany]).state).map(k => child[k]);
                child.remove(firstChildOdd);
            }
        }
        results.addRemoveAndInit[name] = (new Date() - time) / 1500;
        console.log(name + ' = ~ 1500 nodes merges, 1500 resets, 1500 removes, init of 8250x3 lazy children. Took total of: ', new Date() - time, 'ms');
    }, 15000);

    test('access', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        const data = {};
        for (let i = 0; i < 3000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        h.assign(data);
        const time = Date.now();
        for (let i = 0; i < 3000; i++) {
            const accessed = h[i];
        }
        results.access[name] = (Date.now() - time);
    }, 15000);
    test('assign better', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        const data = {};
        for (let i = 0; i < 1000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        const time = now();
        h.assign(data);
        results.assign[name] = (now() - time) + ' ns';
    }, 15000);

    test('assign better bad case', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        let data = {};
        for (let i = 0; i < 1000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }

        h.assign(data);

        data = {};
        for (let i = 0; i < 1000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        const time = now();
        h.assign(data);
        results.assignBetterBadCase[name] = (now() - time) + ' ns';
    }, 15000);

    test('remove worst', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        const data = {};
        for (let i = 0; i < 3000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        h.assign(data);

        const time = new Date();
        Object.keys(h.state)
            .map(k => h[k])
            .filter(({state}) => true)
            .map((it) => h.remove(it.getId()));
        results.removeWorst[name] = (new Date() - time);
        console.log(name + ' = Remove 20000 children semi performance. Took total of: ', new Date() - time, 'ms');
    }, 15000);

    test('create 50000 children', () => {
        const {child} = change({child: {}});
        const data = {};
        for (let i = 0; i < 50000; i++) {
            data[i] = {a: 1, b: {}, c: 3, d: {e: {}}};
        }
        const time = new Date();
        child.assign(data);
        results.create[name] = (new Date() - time);
        console.log(name + ' = create 50000 lazy children. Took total of: ', new Date() - time, 'ms');
    }, 15000);

    test('create 50000 leaf children', () => {
        const {child} = change({child: {}});
        const data = {};
        for (let i = 0; i < 50000; i++) {
            data[i] = i;
        }
        const time = new Date();
        child.assign(data);
        results.createLeafs[name] = (new Date() - time);
        console.log(name + ' = create 50000 leaf children. Took total of: ', new Date() - time, 'ms');
    }, 15000);

});

