import {
    branchPrivates,
    identityPrivates,
    eventTypes,
    poorSet,
} from '../common';

const {IDENTITY, STATE} = branchPrivates;
const {REMOVE_CHILD, RENAME_SELF, CACHED_STATE, RESOLVE_STATE} = identityPrivates;
const {ASSIGN, TOGGLE, CLEAR, REMOVE} = eventTypes;

export default function createStateStore(root, onChange, identity) {
    // eslint-disable-next-line consistent-return
    return function stateManager(event) {
        const {request, location} = event;
        let {param} = event;
        if (location) {
            const trace = createTraceablePath(root, location);
            const target = trace[trace.length - 1];
            switch (request) {
                case TOGGLE:
                    param = !target.state;
                // eslint-disable-next-line no-fallthrough
                case CLEAR:
                    onClearState(target.identifier, param, target.state);
                    target.state = param;
                    break;
                case ASSIGN:
                    onAssign(target.identifier, param, target.state);
                    target.state = {...target.state, ...param};
                    break;
                case REMOVE:
                    if (target.state instanceof Array) target.state = onRemoveFromArray(target.identifier, param, target.state);
                    else target.state = onRemoveFromObject(target, param);
                    break;
                default:
                    throw new Error('Request-type: ' + request + ' not implemented');
            }
            root[STATE] = createNextState(trace);

            identity[CACHED_STATE] = root[STATE];
            console.log({ROOT: identity[RESOLVE_STATE](), CACHED: identity[CACHED_STATE], identity})
            onChange(root[STATE]);
        } else {
            throw new Error('Cannot change state for removed Branch');
        }
    };
}

function createTraceablePath(root, location) {
    let state = root[STATE];
    let identifier = root[IDENTITY];
    delete identifier[CACHED_STATE];
    const list = [{state, identifier}];
    for (let i = location.length - 1; i >= 0; i--) {
        const key = location[i];
        identifier = identifier[key];
        delete identifier[CACHED_STATE];
        state = state[key];
        list.push({key, identifier, state});
    }
    return list;
}

function onAssign(identity, parameter, prevState) {
    for (const k in parameter) {
        if (identity[k] && parameter[k] !== prevState[k]) {
            delete identity[k][CACHED_STATE];
            onClearState(identity[k], parameter[k], prevState[k]);
        }
    }
}

function onClearState(identity, newState = {}, prevState = {}) {
    console.log({identity, newState, prevState})
    for (const k in identity) {
        console.log({k})
        // eslint-disable-next-line curly
        if (newState[k] === prevState[k]){
            console.log('continue')
            continue;
        }
        if (newState[k] !== undefined) {
            console.log('remove ' + k)
            delete identity[k][CACHED_STATE];
            onClearState(identity[k], newState[k], prevState[k]);
        } else {
            identity[REMOVE_CHILD](k);
        }
    }
}

function createNextState(childList) {
    for (let i = childList.length - 1; i > 0; --i) {
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
    const toBeRemoved = poorSet(param);
    const {identifier, state} = target;
    const nextState = {};
    for (const k in state) {
        if (toBeRemoved[k]) {
            if (identifier[k]) {
                identifier[REMOVE_CHILD](k);
            }
        } else {
            if (identifier[k]) {
                delete identifier[k][CACHED_STATE]
            }
            nextState[k] = target.state[k];
        }
    }
    return nextState;
}

function onRemoveFromArray(target, indexes, state) {
    const toBeRemoved = poorSet(indexes);
    const nextState = [];
    const stateLength = state.length;
    for (let i = 0; i < stateLength; i++) {
        const {length} = nextState;
        if (toBeRemoved[i]) {
            if (i in target) {
                target[REMOVE_CHILD](i);
            }
        } else {
            if (i in target && i !== length) {
                target[i][RENAME_SELF](length + '');
            }
            nextState.push(state[i]);
        }
    }
    return nextState;
}
