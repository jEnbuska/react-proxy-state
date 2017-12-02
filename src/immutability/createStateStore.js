import {
    identityPrivates,
    eventTypes,
} from '../common';

const {REMOVE_CHILD, RENAME_SELF, STATE} = identityPrivates;
const {ASSIGN, TOGGLE, CLEAR, REMOVE} = eventTypes;

let stateManager;

export function sendRequest(request, location, param) {
    stateManager(request, location, param);
}

export default function createStateStore(root, onChange) {
    return stateManager = function stateManager(request, location, param) {
        if (location) {
            const trace = createTraceablePath(root, location);
            const target = trace[trace.length - 1];
            switch (request) {
                case TOGGLE:
                    param = !target.state;
                // eslint-disable-next-line no-fallthrough
                case CLEAR:
                    onClear(target.identifier, target.state, param);

                    target.state = param;
                    break;
                case ASSIGN:
                    onAssign(target, param);
                    target.state = {...target.state, ...param};

                    break;
                case REMOVE:
                    if (target.state instanceof Array) target.state = onRemoveFromArray(target, param);
                    else target.state = onRemoveFromObject(target, param);
                    break;
                default:
                    throw new Error('Request-type: ' + request + ' not implemented');
            }
            root[STATE] = createNextState(trace);
            onChange(root[STATE]);
        } else {
            throw new Error('Cannot change state for non existing Branch');
        }
    };
}

function createTraceablePath(root, location) {
    let identifier = root;
    let state = identifier[STATE];
    const list = new Array(location.length+1);
    list[0] = {identifier, state};
    for (let i = 1; i < list.length; ++i) {
        const key = location[i-1];
        identifier = identifier[key];
        state = state[key];
        list[i] = ({key, identifier, state});
    }
    return list;
}

function onAssign(target, parameter) {
    const {state, identifier} = target;
    for (const k in parameter) {
        if (identifier[k] && parameter[k] !== state[k]) {
            onClear(identifier[k], state[k], parameter[k]);
        }
    }
}

function onClear(identifier, state = {}, param = {}) {
    for (const k in identifier) {
        const value = param[k];
        if (value !== state[k]) {
            if (value !== undefined) {
                onClear(identifier[k], state[k], value);
            } else {
                identifier[REMOVE_CHILD](k);
            }
        }
    }
}

function createNextState(childList) {
    for (let i = childList.length-1; i > 0; --i) {
        const {key, state: childState} = childList[i];
        const {state: parentState} = childList[i - 1];
        if (parentState instanceof Array) {
            childList[i - 1].state = [
                ...parentState.slice(0, key),
                childState, ...parentState.slice(Number(key) + 1, parentState.length),
            ];
        } else {
            childList[i - 1].state = {...parentState, [key]: childState};
        }
    }
    return childList[0].state;
}

function onRemoveFromObject(target, param) {
    const {identifier, state} = target;
    const toBeRemoved = new Set(param);
    const nextState = {};
    for (const k in state) {
        if (toBeRemoved.has(k)) {
            if (identifier[k]) {
                identifier[REMOVE_CHILD](k);
            }
        } else {
            nextState[k] = target.state[k];
        }
    }
    return nextState;
}

function onRemoveFromArray(target, indexes) {
    const {identifier, state} = target;
    const toBeRemoved = new Set(indexes);
    const nextState = [];
    const stateLength = state.length;
    for (let i = 0; i < stateLength; i++) {
        const {length} = nextState;
        if (toBeRemoved.has(i)) {
            if (i in identifier) {
                identifier[REMOVE_CHILD](i);
            }
        } else {
            if (i in identifier && i !== length) {
                identifier[i][RENAME_SELF](length + '');
            }
            nextState.push(state[i]);
        }
    }
    return nextState;
}
