export const ASSIGN = 'IMMUTABLE::ASSIGN';
export const CLEAR = 'IMMUTABLE::CLEAR';
export const REMOVE = 'IMMUTABLE::REMOVE';
export const GET_STATE = 'IMMUTABLE::GET_STATE';
export const REPLACE = 'IMMUTABLE::REPLACE';
export const TOGGLE = 'IMMUTABLE::TOGGLE';

const {getPrototypeOf} = Object;

export function onAccessingRemovedBranch(property) {
    // eslint-disable-next-line no-console
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

export function valueIsAssignable(value) {
    return value && value instanceof Object && !invalidParents[getPrototypeOf(value).constructor.name];
}

export function stringify(obj) {
    try {
        return JSON.stringify(obj, null, 2);
    } catch (Exception) {
        return obj;
    }
}

export function findChild(value, location) {
    for (let i = location.length - 1; i >= 0; --i) {
        const key = location[i];
        value = value[key];
    }
    return value;
}

export const branchPrivates = {
    identity: 'IMMUTABLE::identity',
    accessState: 'IMMUTABLE::state',
};

export const identityPrivates = {
    id: 'IDENTITY:id',
    removed: 'IDENTITY::removed',
    parent: 'IDENTITY::parent',
    resolve: 'IDENTITY::resolve',
    push: 'IDENTITY::createChild',
    renameSelf: 'IDENTITY::renameChild',
    removeChild: 'IDENTITY::removeChild',
};

export const invalidReferenceHandler = {
    [ASSIGN](target, param) {
        throw new Error('Cannot apply assign to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
    },
    [CLEAR](target, param) {
        throw new Error('Cannot apply clear to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
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

