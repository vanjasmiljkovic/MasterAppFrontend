import React from 'react';
import { Card, Container } from 'react-bootstrap';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface AdministratorDashboardState {
	isAdministratorLoggedIn: boolean;
}

class AdministratorDashboard extends React.Component { 
	state: AdministratorDashboardState;

	constructor(props: {} | Readonly<{}>){
		super(props);

		this.state = {
			isAdministratorLoggedIn: true,
		}
    }

    componentWillMount() {
        this.getMyData();
    }

    componentWillUpdate() {
        this.getMyData();
    }

    private getMyData() {
        api('/api/administrator/', 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === "error" || res.status === "login") {
                    this.setLoginState(false);
                    return;
                }
            });
    }

    private setLoginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isAdministratorLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

	render(){
        if (this.state.isAdministratorLoggedIn === false) {
            return (
                <Redirect to="/administrator/login"/>
            );
        }
		return (
            <>
            <RoledMainMenu role="administrator" />
			<Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faHome } /> Administrator Panel
                        </Card.Title>
                        <ul>
                            <li><Link to="/administrator/dashboard/category/">Kategorije</Link></li>
                            <li><Link to="/administrator/dashboard/article/">Proizvodi</Link></li>
                            <li><Link to="/administrator/dashboard/order/">Porudzbine</Link></li>
                        </ul>
                    </Card.Body>
                </Card>
            </Container>
            </>
		);
    }
}

export default AdministratorDashboard;
