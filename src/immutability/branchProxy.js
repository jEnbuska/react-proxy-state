import {
    branchPrivates,
    identityPrivates,
    SUBJECT,
    GET_STATE,
    CLEAR_STATE, PARAM,
    invalidParents,
    onAccessingRemovedBranch,
} from '../common';

const {getPrototypeOf} = Object;
const {identity, dispatcher, accessPrevState, accessState, accessPendingState} = branchPrivates;
const {push, resolve} = identityPrivates;
const instanceMethods = {
    state: true,
    assign: true,
    clearState: true,
    remove: true,
    transaction: true,
    getIdentity: true,
    removeSelf: true,
    getId: true,
    _getChildrenRecursively: true,
};
const instanceVariables = {
    [identity]: true,
    [dispatcher]: true,
    [accessState]: true,
    [accessPrevState]: true,
    [accessPendingState]: true,
};

export default {
// eslint-disable-next-line consistent-return
    get(target, k, receiver) {
        if (instanceVariables[k]) {
            return target[k];
        } else if (instanceMethods[k]) {
            return Reflect.get(target, k, receiver);
        }
        const resolved = target[identity][resolve]();
        if (resolved) {
            const state = target[dispatcher]({type: GET_STATE, [SUBJECT]: resolved});
            const createChildProxy = Reflect.get(target, '_createChildProxy', receiver);
            if (typeof k === 'symbol') {
                return k;
            }
            k += ''; // find single child
            if (k in state) {
                return Reflect.apply(createChildProxy, target, [target[dispatcher], target[identity][k] || target[identity][push](k)]);
            }
        } else {
            return onAccessingRemovedBranch(target[identity].getId(), k);
        }
    },
    set(target, property, value, receiver) {
        console.log({
            target,
            property,
            value,
            receiver,
            indentity: target[identity][resolve](),
            dis: target[dispatcher],
        })
        const resolved = target[identity][resolve]();
        if (resolved) {
            target[dispatcher]({
                type: CLEAR_STATE,
                [SUBJECT]: resolved,
                [PARAM]: value,
            });
            console.log({resolved})
            target[dispatcher]({type: CLEAR_STATE, [SUBJECT]: resolved});
            return true;
        } else {
            return false;
        }
    },
};

function valueCanBeBranch(value) {
    return value && value instanceof Object && !invalidParents[getPrototypeOf(value).constructor.name];
}