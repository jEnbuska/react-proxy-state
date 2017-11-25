import React from 'react';
import {func} from 'prop-types';
import Inner from './Inner'
import {mapContextToProps} from '../../../../src';

class App extends React.Component {

    static contextTypes = {
        addTodo: func,
        toggleTodo: func,
    };

    state = {input: ''};

    render() {
        const {state, props: {todos}, context: {addTodo, toggleTodo}} = this;
        return (
            <div>
                TODOS
                {Object.values(todos).map(todo => (
                    <div key={todo.id}>
                        <p>{todo.description}</p>
                        <p onClick={() => toggleTodo(todo.id)}>{'done: ' + todo.done}</p>
                    </div>
                ))}
                <Inner/>
                <input value={state.input} onChange={e => this.setState({input: e.target.value})}/>
                <button onClick={() => addTodo(state.input)}>Submit</button>
            </div>
        )
    }
}

export default mapContextToProps(({todos}) => ({todos}))(App)

