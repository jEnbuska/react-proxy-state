import {branchPrivates} from './common';
import Branch from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateMessenger from './immutability/stateMessenger';
import ProxyInterface from './immutability/ProxyInterface';

const {accessState} = branchPrivates;

export default function immutable(state, onChange) {
    const subject = new Branch(new Identity());
    ProxyInterface.messenger = createStateMessenger(subject, onChange);
    subject[accessState] = state;
    return subject._createProxy();
}
export {default as CreateProvider} from './CreateProvider';
export {default as mapContextToProps} from './mapContextToProps';

