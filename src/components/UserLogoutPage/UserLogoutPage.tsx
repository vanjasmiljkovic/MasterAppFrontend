import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Card from 'react-bootstrap/esm/Card';
import Container from 'react-bootstrap/esm/Container';
import { Redirect } from 'react-router-dom';
import api, { removeTokenData } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface UserLogoutPageState {
    done: boolean;
}

export class UserLogoutPage extends React.Component {
    state: UserLogoutPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            done: false,
        };
    }

    finished() {
        this.setState({
            done: true,
        });
    }

    render() {
        if (this.state.done) {
            return <Redirect to="/user/login"/>
        }

        return (
            <Container>
                <RoledMainMenu role="user" />
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faSignOutAlt } /> Doslo je do greske prilikom odjavljivanja. Pokusajte ponovo!
                        </Card.Title>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    componentDidMount() {
        this.doLogout();
    }

    componentDidUpdate() {
        this.doLogout();
    }

    doLogout() {
        removeTokenData('user');
        this.finished();
    }
}