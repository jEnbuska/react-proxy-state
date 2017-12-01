import {branchPrivates, emptyFunction} from './common';
import Branch from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateStore from './immutability/createStateStore';
import ProxyHandler, {map} from './immutability/ProxyHandler';

const {IDENTITY} = branchPrivates;

export default function createStateProxy(state, onChange) {
    const root = new Branch();
    const identity = new Identity(undefined, undefined, state);
    ProxyHandler.sendRequest = createStateStore(identity, onChange || emptyFunction, identity);
    root[IDENTITY] = identity;
    return new Proxy(root, ProxyHandler);
}

export {default as createProvider} from './CreateProvider';
export {default as mapContextToProps} from './mapContextToProps';