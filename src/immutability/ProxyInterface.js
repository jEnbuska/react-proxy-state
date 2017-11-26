import {
    branchPrivates,
    identityPrivates,
    onAccessingRemovedBranch,
    eventTypes,
} from '../common';

const {IDENTITY, PROXY_CONSTRUCTOR} = branchPrivates;
const {PUSH, RESOLVE, ID} = identityPrivates;
const {GET_STATE, ASSIGN} = eventTypes;

export default class ProxyInterface {

    static messenger;

    static proxyTemplate = {
        set: ProxyInterface.setValue,
        get: ProxyInterface.getProperty,
    };

    static setValue(target, property, value) {
        const location = target[IDENTITY][RESOLVE]();
        if (!location) {
            throw new Error('Cannot cannot set value for removed Branch');
        }
        ProxyInterface.messenger({
            type: ASSIGN,
            location,
            param: {[property]: value},
        });
        return true;
    }

    static getProperty(target, property) {
        if (property === IDENTITY) {
            return target[property];
        } else if (target[property]) {
            return Reflect.get(target, property);
        }

        const location = target[IDENTITY][RESOLVE]();
        if (location) {
            const state = ProxyInterface.messenger({type: GET_STATE, location});
            property += ''; // find single child
            if (state && state instanceof Object && property in state) {
                const func = Reflect.get(target.constructor, PROXY_CONSTRUCTOR);
                return Reflect.apply(func, target, [target[IDENTITY][property] || target[IDENTITY][PUSH](property)]);
            }
        } else {
            return onAccessingRemovedBranch(target[IDENTITY][ID], property);
        }
        return undefined;
    }
}
