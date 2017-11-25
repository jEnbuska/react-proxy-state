import {
    SUBJECT,
    GET_STATE,
    PARAM,
    findChild,
    branchPrivates,
    SET_STATE,
    CLEAR_STATE,
    identityPrivates,
    poorSet,
} from '../common';

const {identity, accessState} = branchPrivates;
const {removeChild, renameSelf} = identityPrivates;

const {entries} = Object;

export default function createStateManager(root) {
    // eslint-disable-next-line consistent-return
    return function stateManager(action) {
        const {type, [SUBJECT]: path, [PARAM]: param} = action;
        if (action.type === GET_STATE) {
            return findChild(root[accessState], action[SUBJECT]);
        }
        const trace = createTraceablePath(root, path);
        const target = trace[trace.length - 1];
        if (type === SET_STATE) {
            onProxySetState(target.identifier, param, target.state);
            target.state = {...target.state, ...param};
        } else if (type === CLEAR_STATE) {
            onProxyClearState(target.identifier, param, target.state);
            target.state = param;
        } else if (target.state instanceof Array) { // REMOVE (from array)
            target.state = onProxyArrayRemove(target.identifier, param, target.state);
        } else { // REMOVE (from object)
            onProxyObjectRemove(target.identifier, param);
            const rReducer = removeReducer.bind(poorSet(param));
            target.state = entries(target.state).reduce(rReducer, {});
        }
        root[accessState] = createNextState(trace);
    };
}

function createTraceablePath(root, path) {
    let state = root[accessState];
    let identifier = root[identity];
    const list = [{state, identifier}];
    for (let i = path.length - 1; i >= 0; i--) {
        const key = path[i];
        identifier = identifier[key];
        state = state[key];
        list.push({key, identifier, state});
    }
    return list;
}

function onProxySetState(identity, newState, prevState) {
    for (let k in newState) {
        k += '';
        if (identity[k] && newState[k] !== prevState[k]) {
            if (k in newState) {
                onProxyClearState(identity[k], newState[k], prevState[k]);
            } else {
                identity[removeChild](k);
            }
        }
    }
}

function onProxyClearState(identity, newState = {}, prevState = {}) {
    for (const k in identity) {
        if (newState[k] !== prevState[k]) {
            if (k in newState) {
                onProxyClearState(identity[k], newState[k], prevState[k]);
            } else {
                identity[removeChild](k);
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

function onProxyObjectRemove(target, keys) {
    for (let k in keys) {
        k = keys[k] + '';
        if (target[k]) {
            target[removeChild](k);
        }
    }
}

function onProxyArrayRemove(target, indexes, state) {
    const toBeRemoved = poorSet(indexes);
    const nextState = [];
    const stateLength = state.length;
    for (let i = 0; i < stateLength; i++) {
        i += '';
        const {length} = nextState;
        if (toBeRemoved[i]) {
            if (target[i]) {
                target[removeChild](i);
            }
        } else {
            if (target[i] && i !== length) {
                target[i][renameSelf](length + '');
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
