import {identityPrivates} from '../common';

const {ADD, REMOVE_CHILD, RENAME_SELF, RESOLVE_LOCATION, ID, REMOVED, PARENT, CACHED_STATE, RESOLVE_STATE, BRANCH_PROXY} = identityPrivates;
export default class Identity {

    [CACHED_STATE];
    [REMOVED];
    [BRANCH_PROXY];

    constructor(key, prev, state) {
        this[ID] = key;
        this[PARENT] = prev;
        this[CACHED_STATE] = state;
    }

    [ADD](key, state) {
        return (this[key] = new Identity(key, this, state));
    }

    [RENAME_SELF](key) {
        if (this[PARENT]) {
            delete this[PARENT][this[ID]];
            this[PARENT][key] = this;
        }
        this[ID] = key;
    }

    [REMOVE_CHILD](key) {
        this[key][REMOVED] = true;
        delete this[key];
    }

    // eslint-disable-next-line consistent-return
    [RESOLVE_STATE]() {
        if (!this[REMOVED]) {
            if (this[CACHED_STATE] !== undefined) {
                return this[CACHED_STATE];
            }
            if (this[CACHED_STATE] === undefined) {
                const parentState = this[PARENT][RESOLVE_STATE]();
                if (parentState) {
                    return this[CACHED_STATE] = parentState[this[ID]];
                }
            }
        }
    }

    // eslint-disable-next-line consistent-return
    [RESOLVE_LOCATION](acc = []) {
        if (!this[REMOVED]) {
            if (this[PARENT]) {
                acc.push(this[ID]);
                return this[PARENT][RESOLVE_LOCATION](acc);
            }
            return acc;
        }
    }
}
