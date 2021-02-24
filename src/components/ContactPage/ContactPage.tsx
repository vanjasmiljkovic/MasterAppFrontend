import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Card, Container } from 'react-bootstrap';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

export class ContactPage extends React.Component {
    render() {
        return (
            <>
            <RoledMainMenu role="user" />
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faPhone } /> Contact details
                        </Card.Title>
                        <Card.Text>
                            Contact details wiill be shown here..
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
            </>
        );
    }
}