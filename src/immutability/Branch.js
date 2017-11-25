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
import branchProxy from './branchProxy';

const {identity, dispatcher} = branchPrivates;
const {resolve} = identityPrivates;
const {defineProperties} = Object;
// Saga state mapper does not dispatch its own actions, instead it should be used like:
// yield put(target.assign, {a:1,b: {}})
export default class Branch {

    constructor(_identity, _dispatcher) {
        defineProperties(this, {
            [identity]: {
                value: _identity,
                enumerable: false,
                configurable: true,
            },
            [dispatcher]: {
                value: _dispatcher,
                enumerable: false,
                writable: true,
            },
        });
    }

    get state() {
        const resolved = this[identity][resolve]();
        if (resolved) {
            return this[dispatcher]({type: GET_STATE, [SUBJECT]: resolved});
        }
        return onAccessingRemovedBranch(this.getId(), 'state');
    }

    getId() {
        return this[identity].getId();
    }

    getIdentity() {
        return this[identity][resolve]();
    }

    assign(value) {
        const identifier = this[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot call assign to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
        } else if (!valueCanBeBranch(value)) {
            throw new Error('Branch does not take leafs as assign parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
        } else if (value instanceof Array) {
            throw new Error(`Target: "${identifier.join(', ')}"\nCannot call set state parameter is Array`);
        }
        this[dispatcher]({
            type: SET_STATE,
            [SUBJECT]: identifier,
            [PARAM]: value,
        });
        return this;
    }

    clearState(value) {
        const identifier = this[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
        } else if (!valueCanBeBranch(value)) {
            throw new Error('Branch does not take leafs as clearState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
        }
        this[dispatcher]({
            type: CLEAR_STATE,
            [SUBJECT]: identifier,
            [PARAM]: value,
        });
        return this;
    }

    remove(...keys) {
        const identifier = this[identity][resolve]();
        if (!identifier) {
            throw new Error('Cannot call remove on removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
        }
        this[dispatcher]({
            type: REMOVE,
            [SUBJECT]: identifier,
            [PARAM]: keys,
        });
        return this;
    }

    _createChildProxy(dispatcher, childIdentity) {
        const child = new Branch(childIdentity, dispatcher);
        return child._createProxy();
    }

    _createProxy() {
        return new Proxy(this, branchProxy);
    }
}