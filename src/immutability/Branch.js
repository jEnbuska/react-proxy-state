import util from 'util';
import {
    branchPrivates,
    identityPrivates,
    eventTypes,
    valueIsAssignable
} from '../common';
import {sendRequest} from './stateHandler';

const {IDENTITY, STATE} = branchPrivates;
const {ADD, RESOLVE_LOCATION, RESOLVE_STATE, BRANCH_PROXY} = identityPrivates;
const descriptor = {configurable: true, enumerable: true};
const {ASSIGN, CLEAR, REMOVE, TOGGLE} = eventTypes;

export default class Branch {

    [IDENTITY];

    constructor(identity) {
        this[IDENTITY] = identity;
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
                return {value: values[index], done: index++ === values.length};
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    [util.inspect.custom]() {
        return '[object Branch]';
    }

    // eslint-disable-next-line class-methods-use-this
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

export const handler = {
    sendRequest: undefined,
    get(target, property, proxy) {
        if (property in target) {
            return Reflect.get(target, property, proxy);
        }
        const identity = target[IDENTITY];
        if (identity[property]) return identity[property][BRANCH_PROXY];
        const state = identity[RESOLVE_STATE]();
        if (state && state[property] !== undefined) {
            const childIdentity = identity[ADD](property);
            const branch = new Proxy(new Branch(childIdentity), this);
            childIdentity[BRANCH_PROXY] = branch;
            return branch;
        }
        return undefined;
    },

    set(target, property, value) {
        if (property === STATE) {
            target[STATE] = value;
        } else {
            const location = target[IDENTITY][RESOLVE_LOCATION]();
            sendRequest(ASSIGN, location, {[property]: value && value.state ? value.state : value});
        }
        return true;
    },

    getOwnPropertyDescriptor() {
        return descriptor;
    },

    has(target, prop) {
        const state = target[IDENTITY][RESOLVE_STATE]();
        return !!(state && state[prop] !== undefined);
    },

    ownKeys(target) {
        //const func = Reflect.get(target, KEYS);
        //return Reflect.apply(func, target, []);
        const state = target[IDENTITY][RESOLVE_STATE]();
        if (valueIsAssignable(state)) {
            return Object.keys(state).filter(it => it !== undefined);
        }
    }
};