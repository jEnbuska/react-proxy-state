import React from 'react';
import {CreateProvider} from '../../../../src';
import * as todosDomain from './todos';

const {initialState: todos, ...todoActions} = todosDomain;

const actions = {...todoActions};
export const initialState = {todos};
export default CreateProvider(initialState, actions);
