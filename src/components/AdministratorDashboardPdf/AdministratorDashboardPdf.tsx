import React from 'react';
import { Alert, Button, Card, Col, Container, Form, Modal, Nav, Row, Table } from 'react-bootstrap';
import { faBackward, faEdit, faFilePdf, faImages, faListUl, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import api, { apiFile, ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import PdfType from '../../types/PdfType';
import { ApiConfig } from '../../config/api.config';


interface AdministratorDashboardPdfProperties {
    match: {
        params: {
            aId: number;
        }
    }
}

interface AdministratorDashboardPdfState {
    isAdministratorLoggedIn: boolean;
    pdfs: PdfType[];
}

class AdministratorDashboardPdf extends React.Component<AdministratorDashboardPdfProperties> { 
	state: AdministratorDashboardPdfState;

	constructor(props: Readonly<AdministratorDashboardPdfProperties>){
		super(props);

		this.state = {
            isAdministratorLoggedIn: true,
            pdfs: [],
		};
    }

    componentDidMount() {
        this.getPdfs();
    }

    componentDidUpdate(oldProps: any) {
        if (this.props.match.params.aId === oldProps.match.params.aId) {
            return;
        }

        this.getPdfs();
    }

    private getPdfs() {
        api('/api/article/' + this.props.match.params.aId + '/?join=documentations' ,'get', {}, 'administrator')
            .then((res: ApiResponse) => {
                if (res.status === "error" || res.status === "login") {
                    this.setLoginState(false);
                    return;
                }

                this.putPdfsInState(res.data.documentations);
            });
    }

    private putPdfsInState(data: PdfType[]) { 
        const newState = Object.assign(this.state, {
            pdfs: data,
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
                            <FontAwesomeIcon icon= { faFilePdf } /> Dokument
                        </Card.Title>

                        <Nav className="mb-3">
                            <Nav.Item>
                                <Link to="/administrator/dashboard/article/" className="btn btn-sm btn-info">
                                    <FontAwesomeIcon icon={ faBackward } /> Povratak na listu proizvoda
                                </Link>
                            </Nav.Item>
                        </Nav>
                        
                        <Row>
                            { this.state.pdfs.map(this.printSinglePdf, this) }
                        </Row>
                        <Form className="mt-5">
                            <p>
                                <strong>Dodavanje novg dokumenta proizvoda</strong>
                            </p>
                            <Form.Group>
                                <Form.Label htmlFor="add-pdf">Izaberi pdf</Form.Label>
                                <Form.File id="add-pdf" />
                            </Form.Group>
                                <Button variant="primary"
                                    onClick={ () => this.doUpload() }>
                                    <FontAwesomeIcon icon= { faPlus } /> Dodaj izabrani pdf
                                </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
		);
    }   

    private async doUpload() {
        const filePickerPdf: any = document.getElementById('add-pdf');

        if (filePickerPdf?.files.length === 0) {
            return;
        }
        const filePdf = filePickerPdf.files[0];
        await this.uploadArticleDocument(this.props.match.params.aId, filePdf);
        filePickerPdf.value = '';

        this.getPdfs();
    }

    private async uploadArticleDocument(articleId: number, filePdf: File) {
        return await apiFile('/api/article/' + articleId + '/uploadPdf/', 'pdf', filePdf, 'administrator');
    }
    
    private printSinglePdf(pdf: PdfType) {
        return (
            <Col xs="12" sm="6" md="4" lg="3">
                <Card>
                    <Card.Body>
                        <img alt={"Document " + pdf.documentationId} 
                            src={ ApiConfig.PDF_PATH + 'ikonica.png' } 
                            className="w-100"/>
                    </Card.Body>
                    <Card.Footer>
                        <Button className="btn btn-info mr-2" block onClick={ () => this.openPdf(pdf.documentationId) } >
                            <FontAwesomeIcon icon= { faFilePdf } /> Otvori dokument
                        </Button>
                            <Button variant="danger" block onClick={ () => this.deletePdf(pdf.documentationId) }>
                                <FontAwesomeIcon icon= { faMinus } /> Obrisi pdf
                            </Button>
                    </Card.Footer>
                </Card>
            </Col>
        );
    }

    //DODATI DA OTVORI TACNO ONAJ DOKUMENT KOJI JE KLIKNUO! a ne ovo [2]
    private openPdf(pdfId: number) {
        console.log(pdfId);
        console.log(this.state.pdfs);
 
        const pdfs = this.state.pdfs;
        //let pdfInArray: object = pdfs.filter(pdf => { 
        //    return pdf.documentationId === pdfId;
        //    }
        //)

        let index = pdfs.findIndex(pdf => pdf.documentationId === pdfId);
        console.log('Index' + index);

        const pdf = this.state.pdfs[index].pdfPath; //uzela naziv pdf-a trenutnog artikla
        console.log('Pdf naziv' + pdf);
        
        const filePath = ApiConfig.PDF_PATH + pdf; //putanja pdf-a je PDF_PATH iz configa i naziv

        if (!filePath) { 
            return;
        }

        window.open(filePath); //otvara se pdf u novom tabu
    }

    private deletePdf(documentationId: number) {
        if (!window.confirm('Da li ste sigurni da zelite da obrisete pdf dokument?')){
            return;
        }
        api('/api/article/'+ this.props.match.params.aId +'/deletePdf/' + documentationId , 'delete', {}, 'administrator') 
            .then((res: ApiResponse) => {
                if (res.status === "error" || res.status === "login") {
                    this.setLoginState(false);
                    return;
                }

                this.getPdfs();
            })
    }
}

export default AdministratorDashboardPdf;
