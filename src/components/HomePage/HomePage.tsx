import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Card, Carousel, Col, Container, ListGroup, Navbar, Row } from "react-bootstrap";
import { ApiConfig } from "../../config/api.config";
import HomePageArticles from "../HomePageArticles/HomePageArticles";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import './HomePage.css';


export default class HomePage extends React.Component {
    render() {
        return(
            <>
            <Row className="Menu w-100">
                    <RoledMainMenu role="visitor"/>
            </Row>
            <Container>
                <Carousel>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src= {ApiConfig.PHOTO_PATH + 'slider1.jpg'}
                        alt="First slide"
                        />
                        <Carousel.Caption>
                        <h3>First slide label</h3>
                        <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src= {ApiConfig.PHOTO_PATH + 'slider1.jpg'}
                        alt="Third slide"
                        />

                        <Carousel.Caption>
                        <h3>Second slide label</h3>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                        className="d-block w-100"
                        src= {ApiConfig.PHOTO_PATH + 'slider1.jpg'}
                        alt="Third slide"
                        />

                        <Carousel.Caption>
                        <h3>Third slide label</h3>
                        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>

                <Row className="mt-3">
                    <Col className="text-center" id="ColumnName">
                        <strong>
                            PROIZVODI
                        </strong>
                        <Row className="text-center ml-5" id="ColumnText">
                            Manometri, termometri, transmiteri
                        </Row>
                    </Col>
                    <Col className="text-center" id="ColumnName">
                        <strong>
                            USLUGE
                        </strong>
                        <Row className="text-center" id="ColumnText">
                        Montaža procesne opreme, remont postrojenja sa procesnom opremom
                        </Row>
                    </Col>
                    <Col className="text-center" id="ColumnName">
                        <strong>
                            LABORATORIJA
                        </strong>
                        <Row className="text-center" id="ColumnText">
                        Akreditovana laboratorija za etaloniranje merila pritiska i temperature
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <HomePageArticles />
                </Row>

                <Row>
                    <Col xs="12" md="4" lg="3">
                        <strong>PREUZMITE NAS KATALOG</strong>
                    </Col>
                    <Col xs="12" md="8" lg="9">
                        <Button id="ButtonPdf" block onClick={ () => this.openPdf() } >
                            <FontAwesomeIcon icon= { faFilePdf } /> Katalog opreme za merenje pritiska i temperature
                        </Button>
                    </Col>
                </Row>
            </Container>
            <Card.Footer className="Footer w-100">
                    <Row>
                        <Col xs="12" md="4" lg="4">
                        Društvo zа inženjering, trgovinu tehničkom i sigurnosnom opremom, proizvodnju i metrologiju MERNOKOR d.o.o
                        </Col>
                        <Col xs="12" md="4" lg="4">
                            Beograd, Srbija 
                            Copyright &copy; 2021 
                        </Col>
                        <Col xs="12" md="4" lg="4">
                            <p>
                            Ratarski put 10b <br/>
                            11080 Zemun, Srbija <br/>
                            tel/fax: 011/316-0450 <br/>
                            email: info@mernokor.com  <br/> 
                            </p>  
                        </Col>
                    </Row>
                </Card.Footer>
            </>
        );
    }

    private openPdf() {
        window.open(ApiConfig.PDF_PATH + "/katalogProizvoda.pdf");
    }
}