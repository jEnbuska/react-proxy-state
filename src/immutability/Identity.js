import {identityPrivates} from '../common';

const {PUSH, REMOVE_CHILD, RENAME_SELF, RESOLVE, ID, REMOVED, PARENT, CACHED_STATE, RESOLVE_STATE} = identityPrivates;
const COUNT = Symbol('COUNT')
export default class Identity {

    [CACHED_STATE];
    [REMOVED];
    static count = 0;

    constructor(key, prev, state) {
        this[COUNT] = Identity.count++;
        this[ID] = key;
        this[PARENT] = prev;
        this[CACHED_STATE] = state;
    }

    [PUSH](key, state) {
        return (this[key] = new Identity(key, this, state));
    }

    [RENAME_SELF](key) {
        if (this[PARENT]) {
            delete this[PARENT][this[ID]];
            this[PARENT][key] = this;
        }
        delete this[CACHED_STATE];
        this[ID] = key;
    }

    [REMOVE_CHILD](key) {
        this[key][REMOVED] = true;
        delete this[key][CACHED_STATE];
        delete this[key];
    }

    // eslint-disable-next-line consistent-return
    [RESOLVE_STATE]() {

        console.log({identity: this, RES_STATE: this[ID], COUNT: this[COUNT], CACHED: this[CACHED_STATE]})
        if (this[CACHED_STATE] !== undefined) {
            console.log('return cached state')
            return this[CACHED_STATE];
        }
        if (!this[REMOVED] && this[CACHED_STATE] === undefined) {
            // eslint-disable-next-line no-return-assign
            return this[CACHED_STATE] = (this[PARENT][RESOLVE_STATE]() || {})[this[ID]];
        }else{
            console.log('no end result')
        }
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
