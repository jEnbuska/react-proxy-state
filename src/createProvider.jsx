import React from 'react';
import {func} from 'prop-types';
import createStateProxy from './index';

let subscriptionsCount = 0;
let lastUpdate = 0;
const defaultParams = {
    delay(timeout = 0) {
        return new Promise(function(resolve) { setTimeout(resolve, timeout) });
    }
}
export default function (initialState, eventHandlerCreators = {}, extraParams = {}) {
    extraParams = Object.assign(defaultParams, extraParams);
    const childContextTypes = {};
    for (const name in eventHandlerCreators) {
        childContextTypes[name] = func;
    }
    return class ContextProvider extends React.Component {

        static childContextTypes = {
            ...childContextTypes,
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
        proxyState;
        lastState;
        version = 0;

        componentWillMount() {
            this.lastState = initialState;
            this.proxyState = createStateProxy(initialState, this.onChange);
            extraParams.next = this.createExtraParameters;
            this.eventHandlers = {};
            for (const name in eventHandlerCreators) {
                this.eventHandlers[name] = this.createEventHandler(eventHandlerCreators[name]);
            }
            const {subscribe, getState, getVersion} = this;
            this.childContextValues = {...this.eventHandlers, subscribe, getState, getVersion};
        }

        createEventHandler = creator => (...params) => creator(...params)(this.proxyState, extraParams);
        createExtraParameters = callback => callback(this.proxyState, extraParams);

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

