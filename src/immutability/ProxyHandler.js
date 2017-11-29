import {
    branchPrivates,
    identityPrivates,
    valueIsAssignable,
    eventTypes,
} from '../common';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {PUSH, RESOLVE} = identityPrivates;
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
        const location = target[IDENTITY][RESOLVE]();
        if (location) {
            const state = ProxyHandler.sendRequest({request: GET_STATE, location});
            if (state && property in state && state[property]!==undefined) {
                const func = Reflect.get(target.constructor, PROXY_CONSTRUCTOR);
                return Reflect.apply(func, target, [target[IDENTITY][property] || target[IDENTITY][PUSH](property)]);
            }
        }
        return undefined;
    }

    static set(target, property, value) {
        const location = target[IDENTITY][RESOLVE]();
        ProxyHandler.sendRequest({
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
        const state = ProxyHandler.sendRequest({request: GET_STATE, location});
        return !!(state && state[prop] !== undefined);
    }

    static ownKeys(target) {
        //const func = Reflect.get(target, KEYS);
        //return Reflect.apply(func, target, []);
        const location = target[IDENTITY][RESOLVE]();
        const state = ProxyHandler.sendRequest({request: GET_STATE, location});
        if (valueIsAssignable(state)) {
            return Object.keys(state).filter(it => it !==undefined);
        }
    }
}
