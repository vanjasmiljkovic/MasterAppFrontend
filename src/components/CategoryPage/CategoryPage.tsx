import { faListAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import ArticleType from '../../types/ArticleType';
import CategoryType from '../../types/CategoryType';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import SingleArticlePreview from '../SingleArticlePreview/SingleArticlePreview';

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
        selectedFeatures: {
            featureId: number;
            value: string;
        }[];
    };
    features: {
        featureId: number;
        name: string;
        values: string[];
    }[];
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
                selectedFeatures: [],
            },
            features: [],
        }; //state je inicijalno prazan
    }

    private setFeatures(features: any) {
        const newState = Object.assign(this.state, {
            features: features,
        });

        this.setState(newState);
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
            <>
            <RoledMainMenu role="user" />
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title className="mb-4 border">
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
            </>
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

    private featureFilterChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const featureId = Number(event.target.dataset.featureId);
        const value = event.target.value;

        if (event.target.checked) {
            this.addFeatureFilterValue(featureId, value);
        }else {
            this.removeFeatureFilterValue(featureId, value);
        }
    }

    private addFeatureFilterValue(featureId:number, value:string) {
        const newSelectedFeatures = [ ...this.state.filters.selectedFeatures];
        newSelectedFeatures.push({
            featureId: featureId,
            value: value,
        });

        this.setSelectedFeatures(newSelectedFeatures);

    }

    private removeFeatureFilterValue(featureId:number, value:string) {
        const newSelectedFeatures = this.state.filters.selectedFeatures.filter(record => {
            if (record.featureId === featureId && record.value === value) {
                return false;
            }

            return true;
        });
        this.setSelectedFeatures(newSelectedFeatures);
    }

    private setSelectedFeatures(newSelectedFeatures: any) {
        this.setState(Object.assign(this.state, {
            filters: Object.assign(this.state.filters, {
                selectedFeatures: newSelectedFeatures,
            })
        }));
    }

    private applyFilters() {
        this.getCategoryData();
    }
    
    private printFilters() {
        return (
          <>
            <Form.Group>
                <Form.Text className="text-center"><h3>Filteri za pretragu</h3></Form.Text>
                <Form.Label htmlFor="keywoards">Kljucne reci:</Form.Label>
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
                    <Form.Label htmlFor="priceMax">Cena max:</Form.Label>
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
                    <option value="price desc">Sortirati po ceni - opadajuce</option>
                </Form.Control>
            </Form.Group>

            { this.state.features.map(this.printFeatureFilterComponent, this) }

            <Form.Group>
                <Button variant="primary" style={ {backgroundColor: '#3c1361'} }block onClick={ () => this.applyFilters() }>
                    <FontAwesomeIcon icon={ faSearch } /> Pretraga
                </Button>
            </Form.Group>
          </>  
        );
    }

    private printFeatureFilterComponent(feature: { featureId: number; name:string; values:string[]; }) {
        return (
            <Form.Group>
                <Form.Label><strong>{ feature.name }</strong></Form.Label>
                { feature.values.map(value => this.printFeatureFilterCheckBox(feature, value), this)}
            </Form.Group>
        );
    }

    private printFeatureFilterCheckBox(feature: any, value: string) {
        return(
            <Form.Check type="checkbox" label={ value } 
            value={ value }
            data-feature-id={ feature.featureId } 
            onChange={ (e:any) => this.featureFilterChanged(e as any) }/>
        )
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
            <Col lg="3" md="4" sm="6" xs="12" key={ 'Category ' + category.categoryId }>
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
            <SingleArticlePreview article={ article } />
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

            const featureFilters: any[] = [ ];

            for (const item of this.state.filters.selectedFeatures) {
                let found = false;
                let foundRef = null;

                for (const featureFilter of featureFilters) {
                    if (featureFilter.featureId === item.featureId) {
                        found = true;
                        foundRef = featureFilter;
                        break;
                    }
                } 

                if (!found) {
                    featureFilters.push({
                        featureId: item.featureId,
                        values: [ item.value ],
                    });
                } else {
                    foundRef.values.push(item.value);
                }
            }

            api('api/article/search/', 'post', {
                categoryId: Number(this.props.match.params.cId),
                keywoards: this.state.filters.keywords,
                priceMin: this.state.filters.priceMinimum,
                priceMax: this.state.filters.priceMaximum,
                features: featureFilters,
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

            this.getFeatures();
    }

    getFeatures() {
        api('api/feature/values/' + this.props.match.params.cId, 'get', {})
        .then((res:ApiResponse) => {
            if (res.status === 'login') {
                return this.setLoginState(false);
            }

            if (res.status === 'error') {
                return this.setMessage('Doslo je do greske. Molim Vas pokusajte da osvezite stranicu');
            }

            this.setFeatures(res.data.features);
        });
    }
}