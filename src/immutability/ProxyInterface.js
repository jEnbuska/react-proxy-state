import {
    branchPrivates,
    identityPrivates,
    GET_STATE,
    REPLACE,
    onAccessingRemovedBranch,
} from '../common';

const {identity} = branchPrivates;
const {push, resolve} = identityPrivates;
const instanceMethods = {
    state: true,
    assign: true,
    clear: true,
    remove: true,
    toggle: true,
};

export default class ProxyInterface {

    static messenger;

    static proxyTemplate = {
        set: ProxyInterface.onSet,
        get: ProxyInterface.onGet,
    };

    static onSet(target, property, value) {
        const identifier = target[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot cannot set value for removed Branch');
        }
        ProxyInterface.messenger({
            type: REPLACE,
            path: identifier,
            param: {[property]: value},
        });
        return true;
    }

    static onGet(target, k, receiver) {
        if (k === identity) {
            return target[k];
        } else if (instanceMethods[k]) {
            return Reflect.get(target, k, receiver);
        }
        if (typeof k === 'symbol') {
            return k;
        }
        const resolved = target[identity][resolve]();
        if (resolved) {
            const state = ProxyInterface.messenger({type: GET_STATE, path: resolved});
            k += ''; // find single child
            if (state && state instanceof Object && k in state) {
                const createChildProxy = Reflect.get(target, '_createChildProxy', receiver);
                return Reflect.apply(createChildProxy, target, [target[identity][k] || target[identity][push](k)]);
            }
        } else {
            return onAccessingRemovedBranch(target[identity].getId(), k);
        }
        return undefined;
    }
}
