import { faListAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import { ApiConfig } from '../../config/api.config';
import ArticleType from '../../types/ArticleType';
import CategoryType from '../../types/CategoryType';

interface CategoryPageProperties {
    match: { //izvlacenje iz URL-a
        params: { //parametara
            cId: number; //konkretno parametar se zove cId - tako se zove u ruti
        }
    }
}

//ocekuje da u sebi sadrzi category tipa CategoryType
interface CategoryPageState {
    isUserLoggedIn: boolean;
    category?: CategoryType; 
    subcategories?: CategoryType[];
    articles?: ArticleType[];
    message:string;
    filters: {
        keywords: string;
        priceMinimum: number;
        priceMaximum: number;
        order: "name asc" | "name desc" | "price asc" | "price desc";
    };
}

interface CategoryDto {
    categoryId: number;
    name: string;
}

interface ArticleDto {
    articleId: number;
    name: string;
    excerpt?: string;
    description?: string;
    articlePrices?: {
        price: number;
        createdAt: string;
    }[],
    photos?: {
        imagePath: string;
    }[],

}

export default class CategoryPage extends React.Component<CategoryPageProperties> {

    state: CategoryPageState; //state je tipa CategoryPageState

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);

        this.state = { 
            isUserLoggedIn: true,
            message: '',
            filters: {
                keywords: '',
                priceMinimum: 0.01,
                priceMaximum: 100000,
                order: "price asc",
            }
        }; //state je inicijalno prazan
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

    private setCategoryData(category: CategoryType) {
        const newState = Object.assign(this.state, {
            category: category,
        });

        this.setState(newState);
    }

    private setSubcategories(subcategories: CategoryType[]) {
        const newState = Object.assign(this.state, {
            subcategories: subcategories,
        });

        this.setState(newState);
    }

    private setArticles(articles: ArticleType[]) {
        const newState = Object.assign(this.state, {
            articles: articles,
        });

        this.setState(newState);
    }

    render(){
        if (this.state.isUserLoggedIn === false) {
            return (
                <Redirect to="/user/login" />
            );
        }
        return (
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faListAlt } /> { this.state.category?.name}  {/*ako postoji category ispisi njegovo ime */}
                        </Card.Title>
                        { this.printOptionalMessage() }

                        { this.showSubcategories() }
                        <Row>
                            <Col xs="12" md="4" lg="3">
                                { this.printFilters() }
                            </Col>
                            <Col xs="12" md="8" lg="9">
                                { this.showArticles() }
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    private setNewFilter(newFilter: any) {
        this.setState(Object.assign(this.state, {
            filter: newFilter,
        }));
    }
    
    private filterKeywordsChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const newFilter = Object.assign(this.state.filters, {
            keywords: event.target.value,
        });

        this.setNewFilter(newFilter);
    }

    private filterPriceMinChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const newFilter = Object.assign(this.state.filters, {
            priceMinimum: Number(event.target.value),
        });

        this.setNewFilter(newFilter);
    }

    private filterPriceMaxChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const newFilter = Object.assign(this.state.filters, {
            priceMaximum: Number(event.target.value),
        });

        this.setNewFilter(newFilter);
    }

    private filterOrderChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        const newFilter = Object.assign(this.state.filters, {
            order: event.target.value,
        });

        this.setNewFilter(newFilter);
    }

    private applyFilters() {
        this.getCategoryData();
    }
    
    private printFilters() {
        return (
          <>
            <Form.Group>
                <Form.Label htmlFor="keywoards">Pretraga po kljucnim recima:</Form.Label>
                <Form.Control type="text" id="keywoards"
                              value={ this.state.filters?.keywords } 
                              onChange={ (e) => this.filterKeywordsChanged(e as any) }
                              />
            </Form.Group>
            <Form.Group>
                <Row>
                    <Col xs="12" sm="6">
                    <Form.Label htmlFor="priceMin">Cena min:</Form.Label>
                        <Form.Control type="number" id="priceMin"
                                      step="0.01" min="0.01" max="99999.99"
                                      value={ this.state.filters?.priceMinimum }
                                      onChange={ (e) => this.filterPriceMinChanged(e as any) }/>
                    </Col>
                    <Col xs="12" sm="6">
                    <Form.Label htmlFor="priceMax">Cena maks:</Form.Label>
                        <Form.Control type="number" id="priceMax"
                                      step="0.01" min="0.02" max="100000"
                                      value={ this.state.filters?.priceMaximum }
                                      onChange={ (e) => this.filterPriceMaxChanged(e as any) }/>
                    </Col>
                </Row>
            </Form.Group>
            <Form.Group>
                <Form.Control as="select" id="sortOrder"
                              value={ this.state.filters?.order }
                              onChange={ (e) => this.filterOrderChanged(e as any) }>
                    <option value="name asc">Sortirati po nazivu - rastuce</option>
                    <option value="name desc">Sortirati po nazivu - opadajuce</option>
                    <option value="price asc">Sortirati po ceni - rastuce</option>
                    <option value="price desc">Sortirati po ceni - rastuce</option>
                </Form.Control>
            </Form.Group>

            <Form.Group>
                <Button variant="primary" block onClick={ () => this.applyFilters() }>
                    <FontAwesomeIcon icon={ faSearch } /> Pretraga
                </Button>
            </Form.Group>
          </>  
        );
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

    private showSubcategories() {
        if (this.state.subcategories?.length === 0) { //ako nema potkategorija nista ne ucitava
            return;
        }

        //ima potkategorija
        return (
            <Row>
                { this.state.subcategories?.map(this.singleCategory) }
            </Row>
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

    private showArticles() {
        if (this.state.articles?.length === 0) {
            return (
                <div>Trenutno nema dostupnih artikala u ovoj kateogriji</div>
            );
        }

        return (
            <Row>
                { this.state.articles?.map(this.singleArticle) }
            </Row>
        );
    }

    private singleArticle(article: ArticleType){
        return (
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="mb-3"> 
                    <Card.Header>
                        <img alt={ article.name }
                             src={ ApiConfig.PHOTO_PATH + 'small/' + article.imageUrl } 
                             className="w-100"
                             />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title as="p">
                            <strong>{ article.name }</strong>
                        </Card.Title>
                        <Card.Text>
                            { article.excerpt }
                        </Card.Text>
                        <Card.Text>
                            Cena : { Number(article.price).toFixed(2) } DIN
                        </Card.Text>
                        <Link to={`/article/${ article.articleId }` }
                              className="btn btn-primary btn-block btn-sm">
                            Detaljnije o artiklu
                        </Link>
                    </Card.Body>
                </Card>
            </Col>
        );
    }

    //kada se komponenta prvi put montira - uzimamo podatke 
    componentDidMount() {
        this.getCategoryData();
    }

    //kada se komponenta apdejtuje
    componentDidUpdate(oldProperties: CategoryPageProperties) {
        if (oldProperties.match.params.cId === this.props.match.params.cId) { 
            return; 
        }
        this.getCategoryData();
    }

    //doprema podatke i setuje ih kao state ove komponente
    private getCategoryData() {
        api('api/category/' + this.props.match.params.cId, 'get', {}) 
            .then( (res: ApiResponse) => {
                if (res.status === 'login') {
                    this.setLoginState(false);
                }

                if (res.status === 'error') {
                    return this.setMessage('Doslo je do greske. Molim Vas pokusajte da osvezite stranicu');
                }

                const categoryData: CategoryType = {
                    categoryId: res.data.categoryId,
                    name: res.data.name,
                }; 

                this.setCategoryData(categoryData);

                const subcategories: CategoryType[] = 
                    res.data.categories.map((category: CategoryDto) => {
                        return {
                            categoryId: category.categoryId,
                            name: category.name,
                        }
                    });

                    this.setSubcategories(subcategories);
            });

            const orderParts = this.state.filters.order.split(' ');
            const orderBy = orderParts[0];
            const orderDirection = orderParts[1].toUpperCase();

            api('api/article/search/', 'post', {
                categoryId: Number(this.props.match.params.cId),
                keywoards: this.state.filters.keywords,
                priceMin: this.state.filters.priceMinimum,
                priceMax: this.state.filters.priceMaximum,
                features: [ ],
                orderBy: orderBy,
                orderDirection: orderDirection,
            })
            .then( (res: ApiResponse) => {
                if (res.status === 'login') {
                    this.setLoginState(false);
                }

                if (res.status === 'error') {
                    return this.setMessage('Doslo je do greske. Molim Vas pokusajte da osvezite stranicu');
                }

                if (res.data.statusCode === 0) {
                    this.setMessage('');
                    this.setArticles([]);
                    return;
                }

                const articles: ArticleType[] = 
                res.data.map( (article: ArticleDto) => {
                    
                    const object: ArticleType = {
                        articleId: article.articleId,
                        name: article.name,
                        excerpt: article.excerpt,
                        description: article.description,
                        imageUrl: '', 
                        price: 0,
                    };

                    if (article.photos !== undefined && article.photos?.length > 0) {
                        object.imageUrl = article.photos[article.photos?.length-1].imagePath; //uzimamo poslednju sliku
                    }

                    if (article.articlePrices !== undefined && article.articlePrices?.length > 0) {
                        object.price = article.articlePrices[article.articlePrices?.length-1].price; //uzimamo poslednju sliku
                    }

                    return object;
                });    

                this.setArticles(articles);
            });
    }
}