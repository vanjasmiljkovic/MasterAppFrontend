import React from 'react';
import { Alert, Button, Card, Container, Form, Modal, Table } from 'react-bootstrap';
import { faBackward, faEdit, faListUl, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import FeatureType from '../../types/FeatureType';
import ApiFeatureDto from '../../dtos/ApiFeatureDto';


interface AdministratorDashboardFeatureProperties {
    match: {
        params: {
            cId: number;
        }
    }
}

interface AdministratorDashboardFeatureState {
    isAdministratorLoggedIn: boolean;
    features: FeatureType[];

    addModal: {
        visible: boolean;
        name: string;
        message: string;
    };

    editModal: {
        featureId?: number;
        visible: boolean;
        name: string;
        message: string;
    };
}

class AdministratorDashboardFeature extends React.Component<AdministratorDashboardFeatureProperties> { 
	state: AdministratorDashboardFeatureState;

	constructor(props: Readonly<AdministratorDashboardFeatureProperties>){
		super(props);

		this.state = {
            isAdministratorLoggedIn: true,
            features: [],

            addModal: {
                visible: false,
                name: '',
                message: '',
            },

            editModal: {
                visible: false,
                name: '',
                message: '',
            },
		};
    }

    //Add Modal

    private setAddModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state, 
            Object.assign(this.state.addModal, {
                visible: newState,
            }) 
        ));
    }

    private setAddModalStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state, 
            Object.assign(this.state.addModal, {
                [ fieldName ]: newValue,
            }) 
        ));
    }

    //Edit Modal

    private setEditModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state, 
            Object.assign(this.state.editModal, {
                visible: newState,
            }) 
        ));
    }

    private setEditModalStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state, 
            Object.assign(this.state.editModal, {
                [ fieldName ]: newValue,
            }) 
        ));
    }

    private setEditModalNumberFieldState(fieldName: string, newValue: any) {
        this.setState(Object.assign(this.state, 
            Object.assign(this.state.editModal, {
                [ fieldName ]: (newValue === 'null') ? null : Number(newValue),
            }) 
        ));
    }

    componentDidMount() {
        this.getFeatures();
    }

    componentDidUpdate(oldProps: any) {
        if (this.props.match.params.cId === oldProps.match.params.cId) {
            return;
        }

        this.getFeatures();
    }

    private getFeatures() {
        api('/api/feature/?filter=categoryId||$eq||' + this.props.match.params.cId, 'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === "error" || res.status === "login") {
                    this.setLoginState(false);
                    return;
                }

                this.putFeaturesInState(res.data);
            });
    }

    private putFeaturesInState(data: ApiFeatureDto[]) { //data nam je niz kategorija
        //Moze i ovako ali samo kada se poklapaju ova dva interfejsa - ApiFeatureDto i FeatureType
        //const features: FeatureType[] = data.map(feature => (feature));
        const features: FeatureType[] = data.map(feature => { //taj niz mapiramo - za svaku kategoriju koju smo ucitali vracamo objekat
            return {
                featureId: feature.featureId,
                name: feature.name,
                categoryId: feature.categoryId,
            };
        });

        const newState = Object.assign(this.state, {
            features: features,
        });

        this.setState(newState);
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
                        <FontAwesomeIcon icon= { faListUl} /> Osobine
                        </Card.Title>
                        <Table hover size="sm" bordered>
                            <thead>
                                <tr>
                                    <th colSpan={ 2 }>
                                        <Link to="/administrator/dashboard/category/"
                                              className="btn btn-sm btn-info">
                                            <FontAwesomeIcon icon={ faBackward } /> Povratak na kategorije
                                        </Link>
                                    </th>
                                    <th className="text-center">
                                        <Button variant="primary" size="sm"
                                            onClick={ () => this.showAddModal() }>
                                            <FontAwesomeIcon icon={ faPlus } /> Dodaj
                                        </Button>
                                    </th>
                                </tr>
                                <tr>
                                    <th className="text-right">ID kategorije</th>
                                    <th>Naziv</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.features.map(feature => (
                                    <tr>
                                        <td className="text-right">{ feature.featureId }</td>
                                        <td>{ feature.name }</td>
                                        <td className="text-center">    
                                            <Button variant="info" size="sm"
                                                onClick={ () => this.showEditModal(feature) }>
                                                <FontAwesomeIcon icon={ faEdit } /> Izmeni
                                            </Button>
                                        </td>
                                    </tr>
                                ), this) }
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
                
                {/* ADD MODAL */}
            
                <Modal size="lg" centered show={ this.state.addModal.visible } onHide={ () => this.setAddModalVisibleState(false) } >
                    <Modal.Header closeButton>
                        <Modal.Title>Dodaj novu osobinu</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label htmlFor="name">Naziv</Form.Label>
                            <Form.Control id="name" type="text" value={ this.state.addModal.name }
                                    onChange={ (e) => this.setAddModalStringFieldState('name', e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={ () => this.doAddFeature() }>
                                <FontAwesomeIcon icon= { faPlus } /> Dodaj osobinu
                            </Button>
                        </Form.Group>
                        { this.state.addModal.message ? (
                            <Alert variant="danger" value={ this.state.addModal.message } />
                        ) : ''}
                    </Modal.Body>
                </Modal>

                {/* EDIT MODAL */}

                <Modal size="lg" centered show={ this.state.editModal.visible } onHide={ () => this.setEditModalVisibleState(false) } >
                    <Modal.Header closeButton>
                        <Modal.Title>Izmena osobine</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label htmlFor="name">Naziv</Form.Label>
                            <Form.Control id="name" type="text" value={ this.state.editModal.name }
                                    onChange={ (e) => this.setEditModalStringFieldState('name', e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={ () => this.doEditFeature() }>
                                <FontAwesomeIcon icon= { faEdit } /> Izmeni osobinu
                            </Button>
                        </Form.Group>
                        { this.state.editModal.message ? (
                            <Alert variant="danger" value={ this.state.editModal.message } />
                        ) : ''}
                    </Modal.Body>
                </Modal>

            </Container>
            </>
		);
    }

    private showAddModal() {  //sva polja setujemo na prazne vrednosti
        this.setAddModalStringFieldState('name', '');
        this.setAddModalStringFieldState('message', '');
        this.setAddModalVisibleState(true);
    }

    private doAddFeature() {
        api('/api/feature/', 'post', {
            name: this.state.addModal.name,
            categoryId: this.props.match.params.cId,
        }, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "login") {
                this.setLoginState(false);
                return;
            }

            if (res.status === "error") {
                this.setAddModalStringFieldState('message', JSON.stringify(res.data));
                return;
            }

            this.setAddModalVisibleState(false);
            this.getFeatures(); //da ponovo ucita kategorije, time ce ubaciti i tu novo kreiranu kategoriju
        });
    }

    private showEditModal(feature: FeatureType) {
        this.setEditModalStringFieldState('name', String(feature.name));
        this.setEditModalNumberFieldState('featureId', feature.featureId.toString());
        this.setEditModalStringFieldState('message', '');
        this.setEditModalVisibleState(true);
    }

    private doEditFeature() {
        api('/api/feature/' + String(this.state.editModal.featureId) + '/' , 'patch', {
            name: this.state.editModal.name,
        }, 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "login") {
                this.setLoginState(false);
                return;
            }

            if (res.status === "error") {
                this.setAddModalStringFieldState('message', JSON.stringify(res.data));
                return;
            }

            this.setEditModalVisibleState(false);
            this.getFeatures(); //da ponovo ucita kategorije, time ce ubaciti i tu novo kreiranu kategoriju
        });
    }
}

export default AdministratorDashboardFeature;
