import React from 'react';
import {func} from 'prop-types';

const {keys} = Object;

const mapContextToProps = (Component, selectState = store => store.state) => {
    const connectClass = class Connect extends React.Component {

        static contextTypes = {
            subscribe: func,
            getVersion: func,
            getState: func,
        };

        state = {};
        version = -1;

        componentWillMount() {
            const {context: {subscribe}} = this;
            this.subscription = subscribe((contextState, version) => {
                if (version !== this.version) {
                    this.version = version;
                    const nextState = selectState(contextState, this.props);
                    const {state} = this;
                    if (state !== nextState && keys({...state, ...nextState}).some(k => state[k] !== nextState[k])) {
                        this.setState(nextState);
                    }
                }
            });
        }

        render() {
            return (<Component
                {...this.props}
                {...this.state}
            />);
        }

        componentWillReceiveProps(nextProps, nextContext) {
            if (nextContext.getVersion() !== this.version) {
                const nextState = selectState(nextContext.getState(), nextProps);
                const {state} = this;
                if (state !== nextState && keys({...state, ...nextState}).some(k => state[k] !== nextState[k])) {
                    this.setState(nextState);
                }
            }
        }

        componentWillUnmount() {
            this.subscription();
        }
    };
    connectClass.displayName = 'C';
    return connectClass;
};

export default (statePicker) => (target) => mapContextToProps(target, statePicker);