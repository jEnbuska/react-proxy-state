import {branchPrivates, emptyFunction} from './common';
import Branch from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateStore from './immutability/createStateStore';
import ProxyHandler from './immutability/ProxyHandler';

const {STATE, IDENTITY} = branchPrivates;

export default function createStateProxy(state, onChange) {
    const root = new Branch();
    ProxyHandler.sendRequest = createStateStore(root, onChange || emptyFunction);
    root[STATE] = state;
    root[IDENTITY] = new Identity();
    return new Proxy(root, ProxyHandler);
}

export {default as createProvider} from './CreateProvider';
export {default as mapContextToProps} from './mapContextToProps';