import React, {Component} from 'react';
import {func} from 'prop-types';
import {mapContextToProps} from 'react-proxy-state';
import TodoItem from './TodoItem';

class TodosApp extends Component {

    static contextTypes = {
        addTodo: func,
        removeAllTodos: func,
    };

    state = {text: ''};

    render() {
        const {state: {text}, props: {todos}, context: {removeAllTodos}} = this;
        return (
            <div>
                <input value={text} onChange={e => this.setState({text: e.target.value})}/>
                <button onClick={this.handleSubmit}>add</button>
                <button onClick={removeAllTodos}>REMOVE ALL</button>
                {Object.values(todos).map(todo => <TodoItem key={todo.id} todo={todo}/>)}
            </div>
        );
    }

    handleSubmit = () => {
        this.context.addTodo(this.state.text);
        this.setState({text: ''});
    }

}

export default mapContextToProps(({todos}) => ({todos}))(TodosApp);

