import {
    branchPrivates,
    identityPrivates,
    eventTypes,
    valueIsAssignable,
    onAccessingRemovedBranch,
} from '../common';
import ProxyInterface from './ProxyInterface';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {RESOLVE, ID} = identityPrivates;
const {ASSIGN, CLEAR, REMOVE, GET_STATE, TOGGLE} = eventTypes;

export default class Branch {

    static [PROXY_CONSTRUCTOR](identity) {
        const branch = new Branch();
        branch[IDENTITY] = identity;
        return new Proxy(branch, ProxyInterface.proxyTemplate);
    }

    get state() {
        const location = this[IDENTITY][RESOLVE]();
        if (location) {
            return ProxyInterface.messenger({type: GET_STATE, location});
        }
        return onAccessingRemovedBranch(this[IDENTITY][ID], 'state');
    }

    assign(param) {
        const location = this[IDENTITY][RESOLVE]();
        if (!location) {
            throw new Error('Cannot call assign to removed Node. Got:', `${param}. Id: "${this[IDENTITY][ID]}"`);
        } else if (!valueIsAssignable(param)) {
            throw new Error('Branch does not take leafs as assign parameters. Got:', `${param}. Identity: "${this[IDENTITY][RESOLVE]().join(', ')}"`);
        } else if (param instanceof Array) {
            throw new Error(`Target: "${location.join(', ')}"\nAssign does not take Arrays as parameters`);
        }
        ProxyInterface.messenger({
            type: ASSIGN,
            location,
            param,
        });
        return this;
    }

    clear(param) {
        const location = this[IDENTITY][RESOLVE]();
        if (!location) {
            throw new Error('Cannot call clear to removed Node. Got:', `${param}. Id: "${this[IDENTITY][ID]}"`);
        }
        ProxyInterface.messenger({
            type: CLEAR,
            location,
            param,
        });
        return this;
    }

    remove(...param) {
        const location = this[IDENTITY][RESOLVE]();
        if (!location) {
            throw new Error('Cannot call remove on removed Node. Got:', `${param}. Id: "${this[IDENTITY][ID]}"`);
        }
        ProxyInterface.messenger({
            type: REMOVE,
            location,
            param,
        });
        return this;
    }

    toggle() {
        const location = this[IDENTITY][RESOLVE]();
        if (!location) {
            throw new Error(`Cannot toggle removed Node. Id: "${this[IDENTITY][ID]}`);
        }
        ProxyInterface.messenger({
            type: TOGGLE,
            location,
        });
    }
}