import {
    branchPrivates,
    identityPrivates,
    onAccessingRemovedBranch,
    valueIsAssignable,
    eventTypes,
} from '../common';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {PUSH, RESOLVE, ID} = identityPrivates;
const {GET_STATE, ASSIGN} = eventTypes;

export default class ProxyHandler {

    static messenger;
    static _descriptor = {configurable: true, enumerable: true};

    static get(target, property) {
        if (property in target) {
            return Reflect.get(target, property);
        } else if (property === IDENTITY) {
            return target[IDENTITY];
        }
        const location = target[IDENTITY][RESOLVE]();
        if (location) {
            const state = ProxyHandler.messenger({request: GET_STATE, location});
            property += '';
            if (state && state instanceof Object && property in state) {
                const func = Reflect.get(target.constructor, PROXY_CONSTRUCTOR);
                return Reflect.apply(func, target, [target[IDENTITY][property] || target[IDENTITY][PUSH](property)]);
            }
        }
        return undefined;
    }

    static set(target, property, value) {
        const location = target[IDENTITY][RESOLVE]();
        ProxyHandler.messenger({
            request: ASSIGN,
            location,
            param: {[property]: value && value.state ? value.state : value},
        });
        return true;
    }

    static getOwnPropertyDescriptor() {
        return ProxyHandler._descriptor;
    }

    static has(target, prop) {
        const location = target[IDENTITY][RESOLVE]();
        const state = ProxyHandler.messenger({request: GET_STATE, location});
        return !!(valueIsAssignable(state) && prop in state);
    }

    static ownKeys(target) {
        //const func = Reflect.get(target, KEYS);
        //return Reflect.apply(func, target, []);
        const location = target[IDENTITY][RESOLVE]();
        const state = ProxyHandler.messenger({request: GET_STATE, location});
        if (valueIsAssignable(state)) {
            return Object.keys(state);
        }
    }
}
