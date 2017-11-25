import change from '../src';

describe('circular state', () => {
    test('circular state should not be cause exception', () => {
        const circular = {};
        circular.circular = circular;
        let child = change(circular);
        for (let i = 0; i < 43; i++) {
            child = child.circular;
        }
    });
});