import {emptyFunction, identityPrivates} from './common';
import Branch, {handler} from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateHandler from './immutability/stateHandler';

const {STATE} = identityPrivates;

export default function createStateProxy(initialState, onChange) {
    const identity = new Identity(undefined, undefined, 0);
    identity[STATE] = initialState;
    createStateHandler(identity, onChange || emptyFunction, identity);
    return new Proxy(new Branch(identity), handler);
}

export {default as createProvider} from './CreateProvider';
export {default as mapContextToProps} from './mapContextToProps';