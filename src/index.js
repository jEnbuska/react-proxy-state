import {branchPrivates, emptyFunction} from './common';
import Branch from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateMessenger from './immutability/stateMessenger';
import ProxyInterface from './immutability/ProxyInterface';

const {STATE, IDENTITY} = branchPrivates;

export default function immutable(state, onChange) {
    const root = new Branch();
    ProxyInterface.messenger = createStateMessenger(root, onChange || emptyFunction);
    root[STATE] = state;
    root[IDENTITY] = new Identity();
    return new Proxy(root, ProxyInterface.proxyTemplate);
}
export {default as createProvider} from './CreateProvider';
export {default as mapContextToProps} from './mapContextToProps';

