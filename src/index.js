import {branchPrivates} from './common';
import Branch from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateMessenger from './immutability/stateMessenger';
import ProxyInterface from './immutability/ProxyInterface';

const {accessState} = branchPrivates;

export default function immutable(state) {
    const subject = new Branch(new Identity());
    ProxyInterface.messenger = createStateMessenger(subject);
    subject[accessState] = state;
    return subject._createProxy();
}
