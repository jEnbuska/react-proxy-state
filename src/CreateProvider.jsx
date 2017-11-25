import React from 'react';
import {object, number, func} from 'prop-types';
import immutable from './index';

const {assign, keys} = Object;

let subscriptionsCount = 0;
let lastUpdate = 0;
export default (initialState, actions = {}) => {
    actions = keys(actions).reduce((actions, name) => assign(actions, {[name]: func}), {});
    return class Provider extends React.Component {

        static propTypes = {
            initialState: object,
        };

        static childContextTypes = {
            ...actions,
            getVersion: func,
            subscribe: func,
            getState: func,
        };

        getChildContext() {
            const {subscribe, getState, getVersion} = this;
            return {
                ...this.actions,
                subscribe,
                getState,
                getVersion,
            };
        }

        getVersion =() => this.version;
        getState = () => this.lastState;

        subscriptions = {};
        proxy;
        lastState;
        version = 0;

        componentWillMount() {
            this.lastState = this.props.initialState;
            this.proxy = immutable(this.props.initialState, this.onChange);
            this.actions = Object.entries(this.props.actions)
                .reduce((actions, [name, action]) =>
                        assign(actions, {
                            [name]: params => action(params)(this.proxy),
                        }),
                    {});
        }

        subscribe = (callback) => {
            const key = ++subscriptionsCount;
            this.subscriptions[key] = callback;
            callback(this.lastState, this.version);
            return () => {
                delete this.subscriptions[key];
            };
        };

        onChange = (state) => {
            this.lastState = state;
            const update = ++lastUpdate;
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                if (update === lastUpdate) {
                    this.version = lastUpdate;
                    for (const id in this.subscriptions) {
                        this.subscriptions[id](state, lastUpdate);
                    }
                }
            }, 0);
        };

        render() {
            return this.props.children;
        }
    }
};