import {branchPrivates, emptyFunction, identityPrivates} from './common';
import Branch from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateStore from './immutability/createStateStore';
import handler from './immutability/proxyHandler';

const {STATE} = identityPrivates;
const {IDENTITY} = branchPrivates;

export default function createStateProxy(state, onChange) {
    const root = new Branch();
    const identity = new Identity();
    identity[STATE] = state;
    createStateStore(identity, onChange || emptyFunction, identity);
    root[IDENTITY] = identity;
    return new Proxy(root, handler);
}

export {default as createProvider} from './CreateProvider';
export {default as mapContextToProps} from './mapContextToProps';