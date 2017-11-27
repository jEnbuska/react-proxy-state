import {
    branchPrivates,
    identityPrivates,
    eventTypes,
    valueIsAssignable,
} from '../common';
import ProxyHandler from './ProxyHandler';
import util from 'util';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {RESOLVE, ID} = identityPrivates;
const {ASSIGN, CLEAR, REMOVE, GET_STATE, TOGGLE} = eventTypes;

export default class Branch {

    static [PROXY_CONSTRUCTOR](identity) {
        const branch = new Branch();
        branch[IDENTITY] = identity;
        return new Proxy(branch, ProxyHandler);
    }

    /*
    * [KEYS]() {
        return Object.keys(this.state);
    }*/

    get state() {
        const location = this[IDENTITY][RESOLVE]();
        return ProxyHandler.messenger({request: GET_STATE, location});
    }

    assign(param) {
        const location = this[IDENTITY][RESOLVE]();
        if (!valueIsAssignable(param)) {
            throw new Error('Branch does not take leafs as assign parameters. Got:', `${param}. Identity: "${this[IDENTITY][RESOLVE]().join(', ')}"`);
        } else if (param instanceof Array) {
            throw new Error(`Target: "${location.join(', ')}"\nAssign does not take Arrays as parameters`);
        }
        ProxyHandler.messenger({
            request: ASSIGN,
            location,
            param,
        });
        return this;
    }

    clear(param) {
        const location = this[IDENTITY][RESOLVE]();

        ProxyHandler.messenger({
            request: CLEAR,
            location,
            param,
        });
        return this;
    }

    remove(...param) {
        const location = this[IDENTITY][RESOLVE]();
        ProxyHandler.messenger({
            request: REMOVE,
            location,
            param,
        });
        return this;
    }

    toggle() {
        const location = this[IDENTITY][RESOLVE]();
        ProxyHandler.messenger({
            request: TOGGLE,
            location,
        });
    }

    [Symbol.iterator]() {
        const values = Object.values(this);
        let index = 0;
        return {
            next() {
                return {value: values[index], done: index++ === values.length}
            },
        };
    }

    [util.inspect.custom]() {
        return '[object Branch]';
    }

    toString() {
        return '[object Branch]';
    }

    toJSON() {
        return this.state;
    }

    [Symbol.toPrimitive]() {
        const {state} = this;
        if (valueIsAssignable(state)) {
            try {
                return JSON.stringify(state, null, 2);
            } catch (e) {
                return state + '';
            }
        }
        return state;
    }
}