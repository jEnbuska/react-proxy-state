import util from 'util';
import {
    branchPrivates,
    identityPrivates,
    eventTypes,
    valueIsAssignable
} from '../common';

import handler from './proxyHandler';
import {sendRequest} from './createStateStore';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {RESOLVE_LOCATION, RESOLVE_STATE, BRANCH_PROXY} = identityPrivates;
const {ASSIGN, CLEAR, REMOVE, TOGGLE} = eventTypes;

export default class Branch {

    [IDENTITY];

    static [PROXY_CONSTRUCTOR](identity) {
        const branch = new Branch();
        branch[IDENTITY] = identity;
        return identity[BRANCH_PROXY] = new Proxy(branch, handler);
    }

    get state() {
        return this[IDENTITY][RESOLVE_STATE]();
    }

    assign(...params) {
        sendRequest(ASSIGN, this[IDENTITY][RESOLVE_LOCATION](), Object.assign({}, ...params));
        return this;
    }

    clear(param) {
        sendRequest(CLEAR, this[IDENTITY][RESOLVE_LOCATION](), param);
        return this;
    }

    remove(...param) {
        sendRequest(REMOVE, this[IDENTITY][RESOLVE_LOCATION](), param);
        return this;
    }

    toggle() {
        sendRequest(TOGGLE, this[IDENTITY][RESOLVE_LOCATION]());
        return this;
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