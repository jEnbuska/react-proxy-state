import {
    branchPrivates,
    identityPrivates,
    eventTypes,
    findChild,
    poorSet,
} from '../common';

const {IDENTITY, STATE} = branchPrivates;
const {REMOVE_CHILD, RENAME_SELF, CREATE_PROXY} = identityPrivates;
const {GET_STATE, ASSIGN, TOGGLE, CLEAR, REMOVE} = eventTypes;

const {entries} = Object;

export default function createStateMessenger(root, onChange = function () {}) {
    // eslint-disable-next-line consistent-return
    return function stateManager(event) {
        const {type, location} = event;
        let {param} = event;
        if (type === GET_STATE) {
            return findChild(root[STATE], location);
        }
        const trace = createTraceablePath(root, location);
        const target = trace[trace.length - 1];
        switch (type) {
            case ASSIGN: {
                onSetState(target.identifier, param, target.state);
                target.state = {...target.state, ...param};
                break;
            }
            case TOGGLE:
                param = !target.state;
                // eslint-disable-next-line no-fallthrough
            case CLEAR: {
                onClearState(target.identifier, param, target.state);
                target.state = param;
                break;
            }
            case REMOVE: {
                if (target.state instanceof Array) {
                    target.state = onRemoveFromArray(target.identifier, param, target.state);
                } else {
                    onRemoveFromObject(target.identifier, param);
                    const rReducer = removeReducer.bind(poorSet(param));
                    target.state = entries(target.state).reduce(rReducer, {});
                }
                break;
            }
            default:
                throw new Error('Event-type' + type + ' not implemented');
        }
        root[STATE] = createNextState(trace);
        onChange(root[STATE]);
    };
}

function createTraceablePath(root, location) {
    let state = root[STATE];
    let identifier = root[IDENTITY];
    const list = [{state, identifier}];
    for (let i = location.length - 1; i >= 0; i--) {
        const key = location[i];
        identifier = identifier[key];
        state = state[key];
        list.push({key, identifier, state});
    }
    return list;
}

function onSetState(identity, newState, prevState) {
    for (let k in newState) {
        k += '';
        if (identity[k] && newState[k] !== prevState[k]) {
            if (k in newState) {
                onClearState(identity[k], newState[k], prevState[k]);
            } else {
                identity[REMOVE_CHILD](k);
            }
        }
    }
}

function onClearState(identity, newState = {}, prevState = {}) {
    for (const k in identity) {
        if (newState[k] !== prevState[k]) {
            if (k in newState) {
                onClearState(identity[k], newState[k], prevState[k]);
            } else {
                identity[REMOVE_CHILD](k);
            }
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

function onRemoveFromObject(target, keys) {
    for (let k in keys) {
        k = keys[k] + '';
        if (target[k]) {
            target[REMOVE_CHILD](k);
        }
    }
}

function onRemoveFromArray(target, indexes, state) {
    const toBeRemoved = poorSet(indexes);
    const nextState = [];
    const stateLength = state.length;
    for (let i = 0; i < stateLength; i++) {
        i += '';
        const {length} = nextState;
        if (toBeRemoved[i]) {
            if (target[i]) {
                target[REMOVE_CHILD](i);
            }
        } else {
            if (target[i] && i !== length) {
                target[i][RENAME_SELF](length + '');
            }
            nextState.push(state[i]);
        }
    }
    return nextState;
}

function removeReducer(acc, e) {
    if (!this[e[0]]) {
        acc[e[0]] = e[1];
    }
    return acc;
}
