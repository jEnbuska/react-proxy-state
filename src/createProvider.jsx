import React from 'react';
import {func} from 'prop-types';
import immutable from './index';

const {assign, keys} = Object;

let subscriptionsCount = 0;
let lastUpdate = 0;
export default function (initialState, eventHandlerCreators = {}) {
    const eventHandlerTypes = keys(eventHandlerCreators).reduce((types, name) => assign(types, {[name]: func}), {});
    return class Provider extends React.Component {

        static childContextTypes = {
            ...eventHandlerTypes,
            getVersion: func,
            subscribe: func,
            getState: func,
        };

        getChildContext() {
            return this.childContextValues;
        }

        getVersion = () => this.version;
        getState = () => this.lastState;

        subscriptions = {};
        proxy;
        lastState;
        version = 0;

        componentWillMount() {
            this.lastState = initialState;
            this.proxy = immutable(initialState, this.onChange);
            this.eventHandlers = Object.entries(eventHandlerCreators)
                .reduce((eventResponders, [name, responder]) =>
                        assign(eventResponders, {
                            [name]: params => responder(params)(this.proxy),
                        }),
                    {});
            const {eventHandlers, subscribe, getState, getVersion} = this;
            this.childContextValues = {...eventHandlers, subscribe, getState, getVersion}
        }

        render() {
            return this.props.children;
        }

        subscribe = (callback) => {
            const key = ++subscriptionsCount;
            this.subscriptions[key] = callback;
            callback(this.lastState, this.version);
            return () => delete this.subscriptions[key];
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
    };
}