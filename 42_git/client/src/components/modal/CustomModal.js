import React from 'react';
import { Modal, Button } from "react-bootstrap";

import trans from '../../translations/translate';

export class CustomModal extends React.Component {

    render() {

        return (
            <Modal
                show={ this.props.show }
                bsSize="large"
                aria-labelledby="contained-modal-title-lg"
                onHide={ this.props.onClose }
            >
                <Modal.Header closeButton>
                    <Modal.Title>{ this.props.title }</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    { this.props.body }
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.props.onClose }>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export class SuperModal extends React.Component {

    buildtitle() {
        return this.props.title;
    }

    buildbody() {
        return this.props.body;
    }

    buildheader() {
        if (this.header === false){
            return null;
        }

        return (
            <Modal.Header closeButton>
                <Modal.Title>{ this.buildtitle() }</Modal.Title>
            </Modal.Header>
        );
    }

    buildfooter() {
        if (this.props.footer){
            return (
                <Modal.Footer>
                    { this.props.footer }
                </Modal.Footer>
            );
        } else if (this.footer === false){
            return null;
        }

        return (
            <Modal.Footer>
                <Button onClick={this.props.onClose }>
                    { trans.get('MODAL.CLOSE') }
                </Button>
            </Modal.Footer>
        );
    }

    show() {
        if (this.props.show || (this.state && this.state.show)){
            return true;
        }

        return false;
    }

    close = e => {
        if (this.props.onClose){
            this.props.onClose(e);
        } else if (this.onClose){
            this.onClose(e);
        }
    }

    render() {

        return (
            <Modal
                show={ this.show() }
                bsSize="large"
                aria-labelledby="contained-modal-title-lg"
                onHide={ this.close }
                keyboard={ this.props.keyboard === false? false : true }
            >

                { this.buildheader() }

                <Modal.Body>
                    { this.buildbody() }
                </Modal.Body>

                { this.buildfooter() }
            </Modal>
        );
    }
}
