export const _README_URL_ = 'https://github.com/jEnbuska/none-dux';
export const SET_STATE = 'NONEDUX::SET_STATE';
export const CLEAR_STATE = 'NONEDUX::CLEAR_STATE';
export const REMOVE = 'NONEDUX::REMOVE';
export const GET_STATE = 'NONEDUX::GET_STATE';
export const SUBJECT = 'NONEDUX::SUBJECT';
export const PARAM = 'NONEDUX::PARAM';

export const has = Object.prototype.hasOwnProperty;
const {getPrototypeOf} = Object;

export function onAccessingRemovedBranch(property) {
    console.error('Accessing ' + property + ' of removed Branch');
}

export const invalidParents = {
    Branch: true,
    Number: true,
    String: true,
    RegExp: true,
    Boolean: true,
    Function: true,
    Date: true,
    Error: true,
};

export function valueCanBeBranch(value) {
    return value && value instanceof Object && !invalidParents[getPrototypeOf(value).constructor.name];
}

export function stringify(obj) {
    try {
        return JSON.stringify(obj, null, 2);
    } catch (Exception) {
        return obj;
    }
}

export function findChild(value, path) {
    for (let i = path.length - 1; i >= 0; --i) {
        const key = path[i];
        value = value[key];
    }
    return value;
}

export const branchPrivates = {
    children: 'NONEDUX::children',
    identity: 'NONEDUX::identity',
    accessState: 'NONEDUX::state',
    accessPrevState: 'NONEDUX::prevState',
    accessPendingState: 'NONEDUX::accessPendingState',
    onSetState: 'NONEDUX::onSetState',
    onClearState: 'NONEDUX::onClearState',
    onRemove: 'NONEDUX::onRemove',
    dispatcher: 'NONEDUX::dispatcher',
    onRemoveChild: 'NONEDUX::onRemoveChild',
    handleChange: 'NONEDUX::handleChange',
    targetBranch: 'NONEDUX::targetBranch',
};

export const identityPrivates = {
    id: 'IDENTITY:id',
    removed: 'IDENTITY::removed',
    parent: 'IDENTITY::parent',
    branch: 'IDENTITY::branch',
    resolve: 'IDENTITY::resolve',
    push: 'IDENTITY::createChild',
    renameSelf: 'IDENTITY::renameChild',
    removeChild: 'IDENTITY::removeChild',
};

export const invalidReferenceHandler = {
    [SET_STATE](target, param) {
        throw new Error('Cannot apply assign to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
    },
    [CLEAR_STATE](target, param) {
        throw new Error('Cannot apply clearState to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
    },
    [REMOVE](target, param) {
        throw new Error('Cannot apply remove to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
    },
};

export function poorSet(arr) {
    return arr.reduce(poorSetReducer, {});
}

function poorSetReducer(acc, k) {
    acc[k + ''] = true;
    return acc;
}

