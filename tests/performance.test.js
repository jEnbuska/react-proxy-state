/* eslint-disable no-console */
import change from '../src';
import {data, data2} from './resources';

const now = require('nano-time');

const {keys} = Object;

function getDuration(start,count) {
    return (((now() - start) / (10 ** 6)) / count) + 'ms';
}

describe('performance', () => {

    test('read', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        const data = {};
        for (let i = 0; i < 3000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        h.assign(data);
        const time = now();
        for (let i = 0; i < 3000; i++) {
            // eslint-disable-next-line no-unused-expressions
            const accessed = h[i];
        }
        console.log('read avg:', getDuration(time, 3000));
    }, 15000);

    test('remove', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        const data = {};
        for (let i = 0; i < 3000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        h.assign(data);
        const time = now();
        Object.keys(h.state).forEach(k => h.remove(k))
        console.log('remove avg:', getDuration(time, 3000));
    }, 15000);

    test('clear', () => {
        const even = data;
        const odd = data2;
        const {child} = change({child: {}});
        const time = now();
        for (let i = 0; i < 3000; i++) {
            if (i % 2 === 0) {
                child.clear(even);
            } else {
                child.clear(odd);
            }
        }
        console.log('clear avg:', getDuration(time, 3000));
    });

    test('assign', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        const data = {};
        for (let i = 0; i < 1000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        const time = now();
        h.assign(data);
        console.log('assign avg:', getDuration(time, 1000));
    }, 15000);

    test('re-assign', () => {
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
        console.log('re-assign avg:', getDuration(time, 1000));
    }, 15000);

    test('remove and read', () => {
        const subject = change({a: {b: {c: {d: {e: {f: {g: {h: {}}}}}}}}});
        const h = subject.a.b.c.d.e.f.g.h;
        const data = {};
        for (let i = 0; i < 3000; i++) {
            data[i] = {a: {}, b: {}, c: {}, d: {a: {}, b: {}, c: {}, d: {}, e: {}}};
        }
        h.assign(data);
        const time = now();
        Object.entries(h.state)
        // eslint-disable-next-line no-unused-vars
            .filter(([k, {state}]) => true)
            .map((k) => h.remove(k));
        console.log('read + remove avg:', getDuration(time, 3000));
    }, 15000);

    test('assign 50000 children', () => {
        const {child} = change({child: {}});
        const data = {};
        for (let i = 0; i < 50000; i++) {
            data[i] = {a: 1, b: {}, c: 3, d: {e: {}}};
        }
        const time = now();
        child.assign(data);
        console.log('assign * 50000 at ones:', getDuration(time, 1));
    }, 15000);

    test('mixed', () => {
        const even = data.companies;
        const odd = data2;
        const firstCompany = keys(even.companies)[0];
        const firstChildOdd = keys(odd)[0];
        const {child} = change({child: {}});
        child.assign(even);
        const time = now();
        for (let i = 0; i < 3000; i++) {
            if (i % 7 === 0) {
                child.clear({});
            }
            if (i % 2 === 0) {
                child.clear(even);
                child.companies[firstCompany].assign(odd[firstChildOdd]);
                child.companies.remove([firstCompany]);
            } else {
                child.clear(odd);
                child[firstChildOdd].assign(even.companies[firstCompany]);
                child.remove([firstChildOdd]);
            }
        }
        console.log('9429 mixed clear, assign and read operations total:', getDuration(time, 1));
    }, 15000);

    test('mixed 2', () => {
        const even = data;
        const odd = data2;
        const firstCompany = keys(even.companies)[0];
        const firstChildOdd = keys(odd)[0];
        const {child} = change({child: {}});
        child.assign(even);
        const time = now();
        for (let i = 0; i < 1500; i++) {
            if (i % 7 === 0) {
                child.clear({});
            }
            if (i % 2 === 0) {
                Object.keys(child.clear(even).state).forEach(k => child[k]);
                Object.keys(child.companies[firstCompany].assign(odd[firstChildOdd]).state).map(k => child[k]);
                child.companies.remove([firstCompany]);
            } else {
                Object.keys(child.clear(odd).state).forEach(k => child[k]);
                Object.keys(child[firstChildOdd].assign(even.companies[firstCompany]).state).forEach(k => child[k]);
                child.remove(firstChildOdd);
            }
        }
        console.log('60965 mixed read, removes and assign total:', getDuration(time, 1));
    }, 15000);
});

