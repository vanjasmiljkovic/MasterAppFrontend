import React from 'react';
import { Button, Card, Col, Container, Form, Nav, Row } from 'react-bootstrap';
import { faBackward, faImages, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import api, { apiFile, ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import PhotoType from '../../types/PhotoType';
import { ApiConfig } from '../../config/api.config';


interface AdministratorDashboardPhotoProperties {
    match: {
        params: {
            aId: number;
        }
    }
}

interface AdministratorDashboardPhotoState {
    isAdministratorLoggedIn: boolean;
    photos: PhotoType[];
}

class AdministratorDashboardPhoto extends React.Component<AdministratorDashboardPhotoProperties> { 
	state: AdministratorDashboardPhotoState;

	constructor(props: Readonly<AdministratorDashboardPhotoProperties>){
		super(props);

		this.state = {
            isAdministratorLoggedIn: true,
            photos: [],
		};
    }

    componentDidMount() {
        this.getPhotos();
    }

    componentDidUpdate(oldProps: any) {
        if (this.props.match.params.aId === oldProps.match.params.aId) {
            return;
        }

        this.getPhotos();
    }

    private getPhotos() {
        api('/api/article/' + this.props.match.params.aId + '/?join=photos' ,'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === "error" || res.status === "login") {
                    this.setLoginState(false);
                    return;
                }

                this.putPhotosInState(res.data.photos);
            });
    }

    private putPhotosInState(data: PhotoType[]) { 
        const newState = Object.assign(this.state, {
            photos: data,
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
			<Container>
                <RoledMainMenu role="administrator" />
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faImages } /> Slike
                        </Card.Title>

                        <Nav className="mb-3">
                            <Nav.Item>
                                <Link to="/administrator/dashboard/article/" className="btn btn-sm btn-info">
                                    <FontAwesomeIcon icon={ faBackward } /> Povratak na listu proizvoda
                                </Link>
                            </Nav.Item>
                        </Nav>

                        <Row>
                            { this.state.photos.map(this.printSinglePhoto, this) }
                        </Row>

                        <Form className="mt-5">
                            <p>
                                <strong>Dodavanje nove slike proizvoda</strong>
                            </p>
                            <Form.Group>
                                <Form.Label htmlFor="add-photo">Izaberi sliku</Form.Label>
                                <Form.File id="add-photo" />
                            </Form.Group>
                                <Button variant="primary"
                                    onClick={ () => this.doUpload() }>
                                    <FontAwesomeIcon icon= { faPlus } /> Dodaj izabranu sliku
                                </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
		);
    }  
    
    private printSinglePhoto(photo: PhotoType) {
        return (
            <Col xs="12" sm="6" md="4" lg="3">
                <Card>
                    <Card.Body>
                        <img alt={"Photo " + photo.photoId} 
                            src={ ApiConfig.PHOTO_PATH + 'small/' + photo.imagePath } 
                            className="w-100"/>
                    </Card.Body>
                    <Card.Footer>
                        { this.state.photos.length > 1 ? (
                            <Button variant="danger" block onClick={ () => this.deletePhoto(photo.photoId)}>
                                <FontAwesomeIcon icon= { faMinus } /> Obrisi sliku
                            </Button>
                        ) : '' }
                    </Card.Footer>
                </Card>
            </Col>
        );
    }

    private async doUpload() {
        const filePickerPhoto: any = document.getElementById('add-photo'); 

        if (filePickerPhoto?.files.length === 0) {
            return;
        }

        const filePhoto = filePickerPhoto.files[0];
        await this.uploadArticlePhoto(this.props.match.params.aId, filePhoto);
        filePickerPhoto.value = '';

        this.getPhotos();
    }

    private async uploadArticlePhoto(articleId: number, filePhoto: File) {
        return await apiFile('/api/article/' + articleId + '/uploadPhoto/', 'photo', filePhoto, 'administrator');
    }

    private deletePhoto(photoId: number) {
        if (!window.confirm('Da li ste sigurni da zelite da obrisete fotografiju?')){
            return;
        }
        api('/api/article/'+ this.props.match.params.aId +'/deletePhoto/' + photoId + '/', 'delete', {}, 'administrator') 
            .then((res: ApiResponse) => {
                if (res.status === "error" || res.status === "login") {
                    this.setLoginState(false);
                    return;
                }

                this.getPhotos();
            })
    }
}

export default AdministratorDashboardPhoto;
