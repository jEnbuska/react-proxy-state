import change from '../src';

describe('set', () => {
    test('set root state', () => {
        const subject = change({val: 1});
        subject.val = {param: 1};
        console.log({root: subject.state})
        expect(subject.val.state).toEqual({param:1})
    });
});
