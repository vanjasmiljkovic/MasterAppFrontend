import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card, Col, Container, Form, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse, saveToken, saveRefreshToken } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

//cuva podatak o tome da li je korisnik ulogovan ili nije
interface UserLoginPageState {
    email: string;
    password: string;
    errorMessage: string;
    isLoggedIn: boolean;
}

export class UserLoginPage extends React.Component {
    state: UserLoginPageState;

    constructor(props: {} | Readonly<{}>){
        super(props);

        //inicijalni state za nasa polja
        this.state = {
            email: '',
            password: '',
            errorMessage: '',
            isLoggedIn: false,
        }
    }

    private formInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const newState = Object.assign(this.state, {
            [ event.target.id ]: event.target.value
        });

        this.setState(newState);
    }

    private setErrorMessage(message: string) {
        const newState = Object.assign(this.state, {
            errorMessage: message,
        });

        this.setState(newState);
    }

    private setLoginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private doLogin() {
        api(                    //api metod iz backend-a - auth.controller
            'auth/user/login',  //putanja
            'post',             //metod
            {                   //objekat koji se salje
                email: this.state.email, 
                password: this.state.password,
            }
        )
        .then((res: ApiResponse) => {
            if (res.status === 'error') {
                this.setErrorMessage('System error...Try again');
                return;
            }

            if (res.status === 'ok') {
                if (res.data.statusCode !== undefined ) {  
                    let message = '';

                    switch (res.data.statusCode) {
                        case -3001: message = 'Unknown e-mail'; break;
                        case -3002: message = 'Bad password'; break;
                    }

                    this.setErrorMessage(message); //prazan/Unknown e-mail/Bad password
                    return;
                }

                //ako je status undefined - setujemo novi token i refresh token
                saveToken('user', res.data.token);
                saveRefreshToken('user', res.data.refreshToken);

                // preusmeriti korisnika na home-> /#/
                this.setLoginState(true);
            }
        });
    }

    render() {
        //ako je loggedin true preusmeri korisnika na pocetnu stranu
        if (this.state.isLoggedIn === true) {
            return (
                <Redirect to="/products" />
            );
        } 
        //u suprotnom ostavi korisnika na log in stranici
        return (
            <>
            <RoledMainMenu role="visitor" />
            <Container>
                <Col md={ { span: 6, offset: 3 } }>
                    <Card>
                        <Card.Body>
                            <Card.Title>
                            <FontAwesomeIcon icon= { faSignInAlt } /> User Login
                            </Card.Title>
                                <Form>
                                    <Form.Group>
                                        <Form.Label htmlFor="email">E-mail: </Form.Label>
                                        <Form.Control type="email" id="email" 
                                                      value= {this.state.email}
                                                      onChange= { event => this.formInputChange(event as any) } />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label htmlFor="password">Password: </Form.Label>
                                        <Form.Control type="password" id="password"
                                                      value= {this.state.password}
                                                      onChange= { event => this.formInputChange(event as any) } />
                                    </Form.Group>
                                    <Form.Group>
                                        <Button variant="primary"
                                                onClick= { () => this.doLogin() }>
                                            Log in
                                        </Button>
                                    </Form.Group>
                                </Form>
                                <Alert variant= "danger"
                                       className={ this.state.errorMessage ? '' : 'd-none'} > 
                                    { this.state.errorMessage }
                                </Alert>
                        </Card.Body>
                    </Card>
                </Col>  
            </Container>
            </>
        );
    }
}