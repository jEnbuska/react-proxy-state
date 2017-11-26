import React from 'react';
import {func} from 'prop-types';
import Inner from './Inner'
import {mapContextToProps} from 'react-proxy-state';

class App extends React.Component {

    static contextTypes = {
        addTodo: func,
        toggleTodo: func,
        removeTodo: func,
    };

    state = {input: ''};

    render() {
        const {state: {input}, props: {todos}, context: {addTodo, toggleTodo, removeTodo}} = this;
        return (
            <div>
                {Object.values(todos).map(todo => (
                    <div key={todo.id}>
                        <p>{todo.description}</p>
                        <button onClick={() => toggleTodo(todo.id)}>{'Toggle: ' + todo.done}</button>
                        <button onClick={() => removeTodo(todo.id)}>{'Remove'}</button>
                    </div>
                ))}
                <Inner/>
                <input value={input} onChange={e => this.setState({input: e.target.value})}/>
                <button onClick={() => addTodo(input)}>Submit</button>
            </div>
        );
    }
}

export default mapContextToProps(({todos}) => ({todos}))(App)

