import React from 'react';

import RcSlider from 'rc-slider';
import Tooltip from 'rc-tooltip';

import { Component } from '../Component';

import 'rc-slider/assets/index.css';

const createSliderWithTooltip = RcSlider.createSliderWithTooltip;
const RcRange = createSliderWithTooltip(RcSlider.Range);
const Handle = RcSlider.Handle;

const handle = (props) => {
    const { value, dragging, index, ...restProps } = props;

    return (
        <Tooltip
            prefixCls="rc-slider-tooltip"
            overlay={value}
            visible={dragging}
            placement="top"
            key={index}
        >
            <Handle value={value} {...restProps} />
        </Tooltip>
    );
};


export class Slider extends Component {

    render() {
        return (
            <RcSlider
                handle={ handle }
                step={ this.props.step }
                min={ this.props.min }
                max={ this.props.max }
                marks={ this.props.marks }
                defaultValue={ this.props.defaultValue }
                value={ this.props.value }
                onChange={ this.props.handleChange }
            />
        );
    }

}

export class Range extends Component {
    render() {
        return (
            <RcRange
                step={ this.props.step }
                min={ this.props.min }
                max={ this.props.max }
                marks={ this.props.marks }
                defaultValue={ this.props.defaultValue }
                tipFormatter={ this.props.tipFormatter? this.props.tipFormatter : value => `${value}` }
                value={ this.props.value }
                onChange={ this.props.handleChange }
            />
        );
    }
}
