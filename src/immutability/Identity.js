import {identityPrivates} from '../common';

const {ADD, REMOVE_CHILD, RENAME_SELF, RESOLVE_LOCATION, ID, REMOVED, PARENT, STATE, RESOLVE_STATE, DEPTH, INDEX} = identityPrivates;
export default class Identity {

    [STATE];
    [REMOVED];

    constructor(key, prev, depth) {
        this[ID] = key;
        this[PARENT] = prev;
        this[DEPTH] = depth;
        this[INDEX] = depth - 1;
    }

    [ADD](key) {
        return (this[key] = new Identity(key, this, this[DEPTH] + 1));
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
        } else if (this[DEPTH]) {
            const parentState = this[PARENT][RESOLVE_STATE]();
            if (parentState) {
                return parentState[this[ID]];
            }
        } else {
            return this[STATE];
        }
    }

    // eslint-disable-next-line consistent-return
    [RESOLVE_LOCATION](acc = new Array(this[DEPTH])) {
        if (!this[REMOVED]) {
            if (this[DEPTH]) {
                acc[this[INDEX]] = this[ID];
                return this[PARENT][RESOLVE_LOCATION](acc);
            }
            return acc;
        }
    }
}
