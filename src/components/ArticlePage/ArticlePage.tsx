import { faBoxOpen, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import { ApiConfig } from '../../config/api.config';
import ApiArticleDto from '../../dtos/ApiArticleDto';
import AddToCartInput from '../AddToCartInput/AddToCartInput';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface ArticlePageProperties {
    match: { //izvlacenje iz URL-a
        params: { //parametara
            aId: number; //konkretno parametar se zove cId - tako se zove u ruti
        }
    }
}

interface FeatureData {
    name: string;
    value: string;
}

interface ArticlePageState {
    isUserLoggedIn: boolean;
    message: string;
    article?: ApiArticleDto;
    features: FeatureData[]; 
}

export default class ArticlePage extends React.Component<ArticlePageProperties> {
    state: ArticlePageState; //state je tipa ArticlePageState

    constructor(props: Readonly<ArticlePageProperties>) {
        super(props);

        this.state = {
            isUserLoggedIn: true,
            message: '',
            features: [],
        };
    }

    private setLoginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isUserLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setMessage(message: string) {
        const newState = Object.assign(this.state, {
            message: message,
        });

        this.setState(newState);
    }

    private setArticleData(articleData: ApiArticleDto | undefined) {
        const newState = Object.assign(this.state, {
            article: articleData,
        });

        this.setState(newState);
    }

    private setFeatureData(features: FeatureData[]) {
        const newState = Object.assign(this.state, {
            features: features,
        });

        this.setState(newState);
    }

    //kada se komponenta prvi put montira - uzimamo podatke 
    componentDidMount() {
        this.getArticleData();
    }

    //kada se komponenta apdejtuje - ako je isti id nema potrebe za ponovnim ucitavanjem artikala, u suprotnom ucitavamo ih ponovo
    componentDidUpdate(oldProperties: ArticlePageProperties) {
        if (oldProperties.match.params.aId === this.props.match.params.aId) { 
            return; 
        }
        this.getArticleData();
    }

    private getArticleData() {
        api('/api/article/' + this.props.match.params.aId, 'get', {})
        .then( (res: ApiResponse) => {
            if (res.status === 'login') {
                this.setLoginState(false);
            }

            if (res.status === 'error') {
                this.setArticleData(undefined);
                this.setFeatureData([]);
                this.setMessage('Doslo je do greske. Molim Vas pokusajte da osvezite stranicu');
                return;
            }

            const data: ApiArticleDto = res.data;

            this.setMessage('');
            this.setArticleData(data);

            const features: FeatureData[] = [];

            for (const articleFeature of data.articleFeatures ) {
                const value = articleFeature.value;
                let name = '';

                for (const feature of data.features) {
                    if (feature.featureId === articleFeature.featureId) {
                        name = feature.name;
                        break;
                    }
                }

                features.push({ 
                    name: name,
                    value: value
                });
            }

            this.setFeatureData(features);
        });
    }

    private printOptionalMessage() {
        if (this.state.message === '') { //ako nema poruke(prazan string) ne prikazuje se nista
            return;
        }
        return (
            <Card.Text>
                { this.state.message }
            </Card.Text>
        );
    }

    render(){
        if (this.state.isUserLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }

        return (
            <>
            <RoledMainMenu role="user" />
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faBoxOpen } /> { this.state.article?.name}  {/*ako postoji category ispisi njegovo ime */}
                        </Card.Title>

                        { this.printOptionalMessage() }

                        {
                            this.state.article ? 
                            ( this.renderArticleData(this.state.article) ) :
                            ''
                        }

                        
                    </Card.Body>
                </Card>
            </Container>
            </>
        );
    }

    renderArticleData(article: ApiArticleDto) {
        return(
            <Row>
                <Col xs="12" lg="8">
                    <div className="excerpt">
                        <b>Kratak opis: </b> <br />
                        {article.excerpt}
                        {console.log(article)}
                    </div>
                    <hr/>

                    <div className="description">
                        <b>Detaljan opis: </b> <br />
                        {article.description}
                    </div>
                    <hr/>

                    <b>Osobine: </b> <br />

                    <ul>
                        {this.state.features.map(feature => (
                            <li>
                                {feature.name}: {feature.value}
                            </li>
                        ), this)}
                    </ul>
                    <hr/>

                    <b>Specifikacija: </b> <br /><br />

                    <Button className="btn btn-info mr-2 w-50" block onClick={ () => window.open(ApiConfig.PDF_PATH + article.documentations[0].pdfPath) } >
                            <FontAwesomeIcon icon= { faFilePdf } /> Otvori dokument
                    </Button>

                </Col>

                <Col xs="12" lg="4">
                    <Row>
                        <Col xs="12">
                            <img alt={ 'Image-' + article.photos[0].photoId }
                                src={ ApiConfig.PHOTO_PATH + 'small/' + article.photos[0].imagePath } 
                                className="w-100 mb-3 border border-dark"/>
                        </Col>
                    </Row>

                    <Row>
                        { article.photos.slice(1).map(photo => (
                            <Col xs="12" sm="6">
                                <img alt={ 'Image-' + photo.photoId }
                                src={ ApiConfig.PHOTO_PATH + 'small/' + photo.imagePath } 
                                className="w-100 border border-dark mb-3"/>
                            </Col>
                        ), this) }
                    </Row>

                    <Row>
                        <Col xs="12" className="mt-3 text-center">
                            <b>
                            Cena: { Number(article.articlePrices[article.articlePrices.length-1].price).toFixed(2) + 'DIN'}
                            </b>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" className="mt-3">
                            <AddToCartInput article={ article } />  
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}