import {
    branchPrivates,
    identityPrivates,
    eventTypes,
    valueIsAssignable,
} from '../common';
import ProxyHandler from './ProxyHandler';
import util from 'util';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {RESOLVE} = identityPrivates;
const {ASSIGN, CLEAR, REMOVE, GET_STATE, TOGGLE} = eventTypes;

export default class Branch {

    static [PROXY_CONSTRUCTOR](identity) {
        const branch = new Branch();
        branch[IDENTITY] = identity;
        return new Proxy(branch, ProxyHandler);
    }

    get state() {
        const location = this[IDENTITY][RESOLVE]();
        return ProxyHandler.sendRequest({request: GET_STATE, location});
    }

    assign(...params) {
        const location = this[IDENTITY][RESOLVE]();
        ProxyHandler.sendRequest({
            request: ASSIGN,
            location,
            param: Object.assign({}, ...params),
        });
        return this;
    }

    clear(param) {
        const location = this[IDENTITY][RESOLVE]();
        ProxyHandler.sendRequest({
            request: CLEAR,
            location,
            param,
        });
        return this;
    }

    remove(...param) {
        const location = this[IDENTITY][RESOLVE]();
        ProxyHandler.sendRequest({
            request: REMOVE,
            location,
            param,
        });
        return this;
    }

    toggle() {
        const location = this[IDENTITY][RESOLVE]();
        ProxyHandler.sendRequest({
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
            return '[object Branch]';
        }
        return state;
    }
}