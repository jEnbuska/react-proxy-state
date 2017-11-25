import {branchPrivates} from './common';
import Branch from './immutability/Branch';
import Identity from './immutability/Identity';
import createStateManager from './immutability/stateManager';

const {dispatcher, accessState} = branchPrivates;

export default function immutable(state) {
    const subject = new Branch(new Identity());
    subject[dispatcher] = createStateManager(subject);
    subject[accessState] = state;
    return subject._createProxy();
}
