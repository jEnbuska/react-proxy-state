import React from 'react';
import {func} from 'prop-types';
import {mapContextToProps} from '../../../../src';

class Inner extends React.Component {

    render() {
        const {props: {todos}} = this;
        return (
            <div/>
        )
    }
}

export default mapContextToProps(({todos})=>({todos}))(Inner)

