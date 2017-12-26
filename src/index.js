import {emptyFunction, identityPrivates} from './common';
import Branch, {handler} from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateStore from './immutability/createStateStore';

const {STATE} = identityPrivates;

export default function createStateProxy(state, onChange) {
    const identity = new Identity(undefined, undefined, 0);
    identity[STATE] = state;
    createStateStore(identity, onChange || emptyFunction, identity);
    return new Proxy(new Branch(identity), handler)
}

export {default as createProvider} from './CreateProvider';
export {default as mapContextToProps} from './mapContextToProps';