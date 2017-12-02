import {
    branchPrivates,
    identityPrivates,
    valueIsAssignable,
    eventTypes,
} from '../common';
import {sendRequest} from './createStateStore';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {ADD, RESOLVE_LOCATION, RESOLVE_STATE, BRANCH_PROXY} = identityPrivates;
const {ASSIGN} = eventTypes;

const descriptor = {configurable: true, enumerable: true};
export default {
    sendRequest: undefined,

    get(target, property, proxy) {
        if (property in target) {
            return Reflect.get(target, property, proxy);
        }
        const identity = target[IDENTITY];
        if (identity[property]) return identity[property][BRANCH_PROXY];
        const state = identity[RESOLVE_STATE]();
        if (state && state[property] !== undefined) {
            const func = Reflect.get(target.constructor, PROXY_CONSTRUCTOR);
            const childIdentity = identity[ADD](property);
            return childIdentity[BRANCH_PROXY] = Reflect.apply(func, target, [childIdentity]);
        }
        return undefined;
    },

    set(target, property, value) {
        const location = target[IDENTITY][RESOLVE_LOCATION]();
        sendRequest(ASSIGN, location, {[property]: value && value.state ? value.state : value});
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