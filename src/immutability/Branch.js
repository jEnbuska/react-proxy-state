import {
    branchPrivates,
    identityPrivates,
    SUBJECT,
    SET_STATE,
    CLEAR_STATE,
    REMOVE,
    PARAM,
    GET_STATE,
    valueCanBeBranch,
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
        const resolved = this[identity][resolve]();
        if (resolved) {
            return ProxyInterface.messenger({type: GET_STATE, [SUBJECT]: resolved});
        }
        return onAccessingRemovedBranch(this[identity].getId(), 'state');
    }

    assign(value) {
        const identifier = this[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot call assign to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
        } else if (!valueCanBeBranch(value)) {
            throw new Error('Branch does not take leafs as assign parameters. Got:', `${value}. Identity: "${this[identity][resolve]().join(', ')}"`);
        } else if (value instanceof Array) {
            throw new Error(`Target: "${identifier.join(', ')}"\nCannot call set state parameter is Array`);
        }
        ProxyInterface.messenger({
            type: SET_STATE,
            [SUBJECT]: identifier,
            [PARAM]: value,
        });
        return this;
    }

    clear(value) {
        const identifier = this[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot call clear to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
        } else if (!valueCanBeBranch(value)) {
            throw new Error('Branch does not take leafs as clear parameters. Got:', `${value}. Identity: "${this[identity][resolve]().join(', ')}"`);
        }
        ProxyInterface.messenger({
            type: CLEAR_STATE,
            [SUBJECT]: identifier,
            [PARAM]: value,
        });
        return this;
    }

    remove(...keys) {
        const identifier = this[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot call remove on removed Node. Got:', `${keys}. Id: "${this[identity].getId()}"`);
        }
        ProxyInterface.messenger({
            type: REMOVE,
            [SUBJECT]: identifier,
            [PARAM]: keys,
        });
        return this;
    }

    _createChildProxy(childIdentity) {
        const child = new Branch(childIdentity);
        return child._createProxy();
    }

    _createProxy() {
        return new Proxy(this, ProxyInterface.proxyTemplate);
    }
}