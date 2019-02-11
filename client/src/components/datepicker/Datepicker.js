import React from 'react';
import Moment from 'moment';

import { Calendar } from 'react-date-range';
import { FormControl } from "react-bootstrap";

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export class DatePicker extends React.Component {

    constructor(props){
        super(props);

        this.handleChange.bind(this);
    }
    
    handleChange = date => {
        this.props.onChange(date);
    }
    
    render(){
        
		return (
			<Calendar
				date={this.props.date}
				onChange={this.handleChange}
			/>
		)
	}
}

export class DatePickerInput extends React.Component {

    constructor(props){
        super(props);

        let date = this.props.date? new Date(this.props.date) : new Date();

        this.state = {
            date    : date,
            calendar: false
        }

        this.handleSelect.bind(this);
        this.handleClick.bind(this);
        this.handleChange.bind(this);
    }

    handleChange = event => {
        let date = new Date(event.target.value);

        if (!event.target.value || !date.valueOf()){
            return;
        }

        this.props.onChange(date);
        this.setState({date:date});
    }
    
	handleSelect = date => {
        
        this.props.onChange(date);
        this.setState({
            calendar: false,
            date    : date
        });
    }
    
    handleClick = event => {
        this.setState({calendar: (!this.state.calendar)});
    }

    toggleCalendar() {
        let className = 'date-picker-calendar';

        if (!this.state.calendar){
            className += ' no-display';
        }

        return className;
    }

	render(){
		return (
            <div>
                <FormControl
                    type="text"
                    className="date-picker-input"
                    value={ Moment(this.state.date).format('L') }
                    onChange={ this.handleChange }
                    onClick={ this.handleClick }
                />

                <div className={this.toggleCalendar()}>
                    <DatePicker
                        date={this.state.date}
                        onChange={this.handleSelect}
                    />
                </div>
            </div>
		)
	}
}

