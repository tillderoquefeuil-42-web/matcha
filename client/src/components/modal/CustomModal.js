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

    render() {

        return (
            <Modal
                show={ this.props.show }
                bsSize="large"
                aria-labelledby="contained-modal-title-lg"
                onHide={ this.props.onClose }
            >
                <Modal.Header closeButton>
                    <Modal.Title>{ this.buildtitle() }</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    { this.buildbody() }
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.props.onClose }>{ trans.get('MODAL.CLOSE') }</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
