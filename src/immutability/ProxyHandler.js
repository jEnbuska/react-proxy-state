import {
    branchPrivates,
    identityPrivates,
    valueIsAssignable,
    eventTypes,
} from '../common';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {PUSH, RESOLVE, RESOLVE_STATE} = identityPrivates;
const {GET_STATE, ASSIGN} = eventTypes;

export default class ProxyHandler {

    static sendRequest;
    static _descriptor = {configurable: true, enumerable: true};

    static get(target, property) {
        if (property in target) {
            return Reflect.get(target, property);
        } else if (property === IDENTITY) {
            return target[IDENTITY];
        }
        const identity = target[IDENTITY];
        const state = identity[RESOLVE_STATE]();
        console.log({state, property})
        if (state && state[property] !== undefined) {
            const func = Reflect.get(target.constructor, PROXY_CONSTRUCTOR);
            const childIdentity = identity[PUSH](property, state[property]);
            return Reflect.apply(func, target, [childIdentity]);
        }
        return undefined;
    }

    static set(target, property, value) {
        const identity = target[IDENTITY];
        const location = identity[RESOLVE]();
        const param = {[property]: value && value.state ? value.state : value};
        ProxyHandler.sendRequest({
            request: ASSIGN,
            location,
            param
        });
        return true;
    }

    static getOwnPropertyDescriptor() {
        return ProxyHandler._descriptor;
    }

    static has(target, prop) {
        const state = target[IDENTITY][RESOLVE_STATE]();
        return !!(state && state[prop] !== undefined);
    }

    static ownKeys(target) {
        //const func = Reflect.get(target, KEYS);
        //return Reflect.apply(func, target, []);
        const location = target[IDENTITY][RESOLVE]();
        const state = ProxyHandler.sendRequest({request: GET_STATE, location});
        if (valueIsAssignable(state)) {
            return Object.keys(state).filter(it => it !== undefined);
        }
    }
}
