import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CategoryType from '../../types/CategoryType';
import { Link, Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';

interface HomePageState {
	isUserLoggedIn: boolean;
	categories: CategoryType[];
}

interface ApiCategoryDto { //podaci sa kojima radimo
    categoryId: number;
    name: string;
}

class HomePage extends React.Component { 
	state: HomePageState;

	constructor(props: {} | Readonly<{}>){
		super(props);

		this.state = {
			isUserLoggedIn: true,
			categories: [],
		}
    }

    componentWillMount() {
        this.getCategories();
    }

    componentWillUpdate() {
        this.getCategories();
    }
    
    //dopremanje podataka
    private getCategories() { 
        api('/api/category/', 'get', {}) //api metod - backend: category.controller.ts
            .then( (res: ApiResponse) => {
                if (res.status === "error"|| res.status === "login") {
                    this.setLoginState(false);
                    return;
                }

                this.putCategoriesInState(res.data);
            });
    }

    private putCategoriesInState(data: ApiCategoryDto[]) { //data nam je niz kategorija
        const categories:CategoryType[] = data.map(category => { //taj niz mapiramo - za svaku kategoriju koju smo ucitali vracamo objekat
            return {
                categoryId: category.categoryId,
                name: category.name,
                items: [],
            };
        });

        const newState = Object.assign(this.state, {
            categories: categories,
        });

        this.setState(newState);
    }

    private setLoginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isUserLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

	render(){
        if (this.state.isUserLoggedIn === false) {
            return (
                <Redirect to="/user/login"/>
            );
        }
		return (
			<Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faListAlt } /> Top level categories
                        </Card.Title>
                        <Row>
                            { this.state.categories.map(this.singleCategory) }
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
		);
    }
    
    private singleCategory(category: CategoryType){
        return (
            <Col lg="3" md="4" sm="6" xs="12">
                <Card className="mb-3"> 
                    <Card.Body>
                        <Card.Title as="p">
                            { category.name }
                        </Card.Title>
                        <Card.Text>
                            Neki opis proizvoda lalalalalalalala
                            to je sve proizvod .......
                        </Card.Text>
                        <Link to={`/category/${ category.categoryId }` }
                              className="btn btn-primary btn-block btn-sm">
                            Open category
                        </Link>
                    </Card.Body>
                </Card>
            </Col>
        );
    }
}

export default HomePage;
