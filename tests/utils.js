import { createStore, applyMiddleware, combineReducers, } from 'redux';
import reducers from './reduxReducers';
import nonedux from '../src';


export function createStoreWithNonedux(initialState) {
  const { reducers, middlewares, subject, } = nonedux({ initialState, });
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(combineReducers({ ...reducers, }));
  return { subject, store, };
}

export const configs = [ 'legacy', 'proxy', ];

export function createReduxStore() {
  return createStore(reducers);
}