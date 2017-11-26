export const branchPrivates = {
    IDENTITY: Symbol('IDENTITY'),
    STATE: Symbol('ACCESS_STATE'),
    PROXY_CONSTRUCTOR: Symbol('PROXY_CONSTRUCTOR'),
};

export const identityPrivates = {
    ID: Symbol('id'),
    REMOVED: Symbol('REMOVED'),
    PARENT: Symbol('PARENT'),
    RESOLVE: Symbol('RESOLVE'),
    PUSH: Symbol('PUSH'),
    RENAME_SELF: Symbol('RENAME_CHILD'),
    REMOVE_CHILD: Symbol('REMOVE_CHILD'),
};

export const eventTypes = {
    ASSIGN: Symbol('ASSIGN'),
    CLEAR: Symbol('CLEAR'),
    REMOVE: Symbol('REMOVE'),
    GET_STATE: Symbol('GET_STATE'),
    REPLACE: Symbol('REPLACE'),
    TOGGLE: Symbol('TOGGLE'),
};

export const invalidAssignableTypes = {
    Branch: true,
    Number: true,
    String: true,
    RegExp: true,
    Boolean: true,
    Function: true,
    Date: true,
    Error: true,
};

const {getPrototypeOf} = Object;

export function valueIsAssignable(value) {
    return value && value instanceof Object && !invalidAssignableTypes[getPrototypeOf(value).constructor.name];
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

export const invalidReferenceHandler = {
    [eventTypes.ASSIGN](target, param) {
        throw new Error('Cannot apply assign to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
    },
    [eventTypes.CLEAR](target, param) {
        throw new Error('Cannot apply clear to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
    },
    [eventTypes.REMOVE](target, param) {
        throw new Error('Cannot apply remove to detached child ' + target.join(', ') + '\nParam: ' + stringify(param));
    },
};

export function poorSet(arr) {
    return arr.reduce(poorSetReducer, {});
}

export function excludeFromEntries(params) {
    const exluded = poorSet(params);
    return function excluder(e) {
        return !exluded[e[0]];
    };
}

export function entriesToObject(acc, [k, v]) {
    acc[k] = v;
    return acc;
}

function poorSetReducer(acc, k) {
    acc[k + ''] = true;
    return acc;
}

export function onAccessingRemovedBranch(property) {
    // eslint-disable-next-line no-console
    console.error('Accessing ' + property + ' of removed Branch');
}

