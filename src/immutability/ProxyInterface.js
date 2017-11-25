import {
    branchPrivates,
    identityPrivates,
    SUBJECT,
    GET_STATE,
    CLEAR_STATE, PARAM,
    onAccessingRemovedBranch,
} from '../common';

const {identity} = branchPrivates;
const {push, resolve} = identityPrivates;
const instanceMethods = {
    state: true,
    assign: true,
    clear: true,
    remove: true,
};

export default class ProxyInterface {

    static messenger;

    static proxyTemplate = {
        set: ProxyInterface.set,
        get: ProxyInterface.get,
    };

    static set(target, property, value) {
        const identifier = target[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot call clear state of non existing Branch');
        }
        ProxyInterface.messenger({
            type: CLEAR_STATE,
            [SUBJECT]: identifier,
            [PARAM]: {[property]: value},
        });
        return true;
    }

    static get(target, k, receiver) {
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
            const state = ProxyInterface.messenger({type: GET_STATE, [SUBJECT]: resolved});
            k += ''; // find single child
            if (k in state) {
                const createChildProxy = Reflect.get(target, '_createChildProxy', receiver);
                return Reflect.apply(createChildProxy, target, [target[identity][k] || target[identity][push](k)]);
            }
        } else {
            return onAccessingRemovedBranch(target[identity].getId(), k);
        }
    }
}
