import {
    branchPrivates,
    identityPrivates,
    ASSIGN,
    CLEAR,
    REMOVE,
    GET_STATE,
    TOGGLE,
    valueIsAssignable,
    onAccessingRemovedBranch,
} from '../common';
import ProxyInterface from './ProxyInterface';

const {identity} = branchPrivates;
const {resolve} = identityPrivates;
const {defineProperties} = Object;
// Saga state mapper does not dispatch its own actions, instead it should be used like:
// yield put(target.assign, {a:1,b: {}})

export default class Branch {

    constructor(_identity) {
        defineProperties(this, {
            [identity]: {
                value: _identity,
                enumerable: false,
                configurable: true,
            },
        });
    }

    get state() {
        const location = this[identity][resolve]();
        if (location) {
            return ProxyInterface.messenger({type: GET_STATE, location});
        }
        return onAccessingRemovedBranch(this[identity].getId(), 'state');
    }

    assign(param) {
        const location = this[identity][resolve]();
        if (!location) {
            throw new Error('Cannot call assign to removed Node. Got:', `${param}. Id: "${this[identity].getId()}"`);
        } else if (!valueIsAssignable(param)) {
            throw new Error('Branch does not take leafs as assign parameters. Got:', `${param}. Identity: "${this[identity][resolve]().join(', ')}"`);
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
        const location = this[identity][resolve]();
        if (!location) {
            throw new Error('Cannot call clear to removed Node. Got:', `${param}. Id: "${this[identity].getId()}"`);
        }
        ProxyInterface.messenger({
            type: CLEAR,
            location,
            param,
        });
        return this;
    }

    remove(...param) {
        const location = this[identity][resolve]();
        if (!location) {
            throw new Error('Cannot call remove on removed Node. Got:', `${param}. Id: "${this[identity].getId()}"`);
        }
        ProxyInterface.messenger({
            type: REMOVE,
            location,
            param,
        });
        return this;
    }

    toggle() {
        const location = this[identity][resolve]();
        if (!location) {
            throw new Error(`Cannot toggle removed Node. Id: "${this[identity].getId()}`);
        }
        ProxyInterface.messenger({
            type: TOGGLE,
            location,
        });
    }

    _createChildProxy(childIdentity) {
        const child = new Branch(childIdentity);
        return child._createProxy();
    }

    _createProxy() {
        return new Proxy(this, ProxyInterface.proxyTemplate);
    }
}