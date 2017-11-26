import {createProvider} from '../../../../src';
import * as todosDomain from './todos';

const {initialState: todos, addTodo, removeTodo, toggleTodo} = todosDomain;

const actionDescriptions = {addTodo, removeTodo, toggleTodo};
export const initialState = {todos};
export default createProvider(initialState, actionDescriptions);

function bla(){
    actionDescriptions.addTodo
    actionDescriptions.removeTodo
    actionDescriptions.toggleTodo
}