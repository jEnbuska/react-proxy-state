import {identityPrivates} from '../common';

const {ADD, REMOVE_CHILD, RENAME_SELF, RESOLVE_LOCATION, ID, REMOVED, PARENT, STATE, RESOLVE_STATE} = identityPrivates;
export default class Identity {

    [STATE];
    [REMOVED];

    constructor(key, prev) {
        this[ID] = key;
        this[PARENT] = prev;
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
        if (this[REMOVED]) {
            return undefined;
        } else if (this[PARENT]) {
            const parentState = this[PARENT][RESOLVE_STATE]();
            if (parentState) {
                return parentState[this[ID]];
            }
        } else {
            return this[STATE];
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
