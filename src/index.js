import 'babel-polyfill';
import { has, branchPrivates, _README_URL_, } from './common';
import Branch from './immutability/Branch';
import ProxyBranch from './immutability/ProxyBranch';
import Identity from './immutability/Identity';
import { createStateAccessMiddleware, createThunk, createStateChanger, } from './immutability/middlewares';

const { assign, keys, defineProperties, } = Object;
const { accessState, accessPrevState, accessPendingState, } = branchPrivates;

export default function initNonedux({ initialState }) {
  if (!Branch.valueCanBeBranch(initialState) || !keys(initialState).length) {
    throw new Error('Invalid initialState.'+
    `expected something like:
      nonedux( { initialState } ) // initialState wrapped in object
      // initialState must contain all the root level instances used in application
    `);
  }
  let subject = new ProxyBranch(new Identity(), { dispatch: () => {}, });

  const stateAccess = createStateAccessMiddleware(subject);
  const noneduxStateChanger = createStateChanger(subject);
  const reducers = keys(initialState).reduce((acc, k) => assign(acc, { [k]: createDummyReducer(k, subject), }), {});
  definedRootBranchProperties(subject, initialState);
  subject = subject._createProxy();
  const thunk = createThunk(subject, initialState);
  return {
    reducers,
    middlewares: [ stateAccess, thunk, noneduxStateChanger, ],
    subject,
    get thunk() {
      throw new Error('Nonedux thunk middleware is no longer available separately.\nUse the list of "middlewares"  provided from the same function call\nSee README part: "Configuring store" at '+_README_URL_);
    },
    get reducer() {
      throw new Error('Nonedux reducer is deprecated\nInstead user reducers with combineReducers\nSee README part: "Configuring store" at '+_README_URL_);
    },
    dispatcher: () => console.warn('Usage of dispatcher is deprecated and can be removed'),
  };
}

function createDummyReducer(key, root) {
  return () => root[accessState][key];
}

function definedRootBranchProperties(root, initialState) {
  const { setState: initialSetState, } = root;
  defineProperties(root, {
    remove: {
      get() { return function () { throw new Error('Cannot remove root branch values'); }; },
    },
    clearState: {
      get() {
        return function () { throw new Error('clearState cannot be be called on root branch, instead use setState'); };
      },
    },
    setState: {
      get() {
        return (value) => {
          const invalidParams = keys(value).filter(k => !has.call(initialState, k));
          if (invalidParams.length) {
            throw new Error('Missing initialState description for "' + invalidParams.join(', ') + '"');
          }
          return initialSetState.bind(root, value)();
        };
      },
    },
    [accessState]: {
      value: initialState,
      writable: true,
      configurable: true,
      enumerable: false,
    },
    [accessPrevState]: {
      value: {},
      writable: true,
      configurable: true,
      enumerable: false,
    },
    [accessPendingState]: {
      value: null,
      writable: true,
      configurable: true,
      enumerable: false,
    },
  });
}