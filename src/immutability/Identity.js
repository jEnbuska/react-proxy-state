import {identityPrivates} from '../common';

const {PUSH, REMOVE_CHILD, RENAME_SELF, RESOLVE, ID, REMOVED, PARENT} = identityPrivates;

export default class Identity {

    constructor(key, prev) {
        this[ID] = key;
        this[PARENT] = prev;
    }

    [PUSH](key) {
        return (this[key] = new Identity(key, this));
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

    [RESOLVE](acc = []) {
        if (this[REMOVED]) {
            return false;
        }
        if (this[ID]) {
            acc.push(this[ID]);
            return this[PARENT][RESOLVE](acc);
        }
        return acc;
    }
}
