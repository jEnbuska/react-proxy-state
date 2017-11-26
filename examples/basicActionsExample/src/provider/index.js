import React from 'react';
import {createProvider} from '../../../../src';
import * as todosDomain from './todos';

const {initialState: todos, ...todoResponders} = todosDomain;

const responders = {...todoResponders};
export const initialState = {todos};
export default createProvider(initialState, responders);
