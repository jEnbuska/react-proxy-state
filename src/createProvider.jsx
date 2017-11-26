import React from 'react';
import {func} from 'prop-types';
import immutable from './index';

const {assign, keys} = Object;

let subscriptionsCount = 0;
let lastUpdate = 0;
export default function (initialState, responders = {}) {
    const responderTypes = keys(responders).reduce((types, name) => assign(types, {[name]: func}), {});
    return class Provider extends React.Component {

        static childContextTypes = {
            ...responderTypes,
            getVersion: func,
            subscribe: func,
            getState: func,
        };

        getChildContext() {
            const {subscribe, getState, getVersion} = this;
            return {
                ...this.eventResponders,
                subscribe,
                getState,
                getVersion,
            };
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
            this.eventResponders = Object.entries(responders)
                .reduce((eventResponders, [name, responder]) =>
                        assign(eventResponders, {
                            [name]: params => responder(params)(this.proxy),
                        }),
                    {});
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