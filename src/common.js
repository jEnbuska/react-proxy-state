export const branchPrivates = {
    IDENTITY: Symbol('BRANCH::IDENTITY'),
    STATE: Symbol('BRANCH::ACCESS_STATE'),
    PROXY_CONSTRUCTOR: Symbol('BRANCH::PROXY_CONSTRUCTOR'),
    KEYS: Symbol('BRANCH::KEYS'),
};

export const identityPrivates = {
    ID: Symbol('IDENTITY::ID'),
    BRANCH_PROXY: Symbol('IDENTITY::BRANCH_PROXY'),
    STATE: Symbol('IDENTITY::CACHED_STATE'),
    REMOVED: Symbol('IDENTITY::REMOVED'),
    PARENT: Symbol('IDENTITY::PARENT'),
    RESOLVE_LOCATION: Symbol('IDENTITY::RESOLVE_LOCATION'),
    ADD: Symbol('IDENTITY::ADD'),
    RENAME_SELF: Symbol('IDENTITY::RENAME_CHILD'),
    REMOVE_CHILD: Symbol('IDENTITY::REMOVE_CHILD'),
    RESOLVE_STATE: Symbol('IDENTITY::RESOLVE_STATE')
};

export const eventTypes = {
    ASSIGN: Symbol('EVENT::ASSIGN'),
    CLEAR: Symbol('EVENT::CLEAR'),
    REMOVE: Symbol('EVENT::REMOVE'),
    REPLACE: Symbol('EVENT::REPLACE'),
    TOGGLE: Symbol('EVENT::TOGGLE'),
};

export const invalidAssignableTypes = {
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

export function emptyFunction() {}