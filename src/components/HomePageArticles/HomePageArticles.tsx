import React from 'react';
import { Card, Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CategoryType from '../../types/CategoryType';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import ApiCategoryDto from '../../dtos/ApiCategoryDto';
import ArticleType from '../../types/ArticleType';
import ApiArticleDto from '../../dtos/ApiArticleDto';
import { ApiConfig } from '../../config/api.config';
import './HomePageArticles.css';

interface HomePageArticlesProperties {
    match: { //izvlacenje iz URL-a
        params: { //parametara
            aId: number; //konkretno parametar se zove cId - tako se zove u ruti
        }
    }
}

interface HomePageArticlesState {
	categories: CategoryType[];
    subcategories?: CategoryType[];
    articles?: ArticleType[];
    message:string;
}


interface CategoryDto {
    categoryId: number;
    name: string;
}

class HomePageArticles extends React.Component { 
	state: HomePageArticlesState;

	constructor(props: {} | Readonly<{}>){
		super(props);

		this.state = {
			categories: [],
            message: '',
		}
    }

    componentDidMount() {
        this.getCategories();
        this.getArticles();
    }
/*
    componentDidUpdate() {
        this.getCategories();
    }
*/

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

    private setSubcategories(subcategories: CategoryType) {
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
    
    //dopremanje podataka
    private getCategories() { 
        api('/products', 'get', {}) //api metod - backend: category.controller.ts - vadimo samo one top level kategorije, koji nemaju parent kategoriju
            .then( (res: ApiResponse) => {
                this.putCategoriesInState(res.data);
            });
    }

    private putCategoriesInState(data: ApiCategoryDto[]) { //data nam je niz kategorija
        const categories:CategoryType[] = data.map(category => { //taj niz mapiramo - za svaku kategoriju koju smo ucitali vracamo objekat
            return {
                categoryId: category.categoryId,
                name: category.name,
                parentCategoryId: category.parentCategoryId,
            };
        });

        const newState = Object.assign(this.state, {
            categories: categories,
        });

        this.setState(newState);
    }

    private getArticles() {
        api('/articles/?join=articleFeatures&join=features&join=articlePrices&join=photos&join=documentations&join=category', 'get', {})
            .then((res: ApiResponse) => {
                //console.log(res.data);
                this.putArticlesInState(res.data);
            });
    }

    private putArticlesInState(data: ApiArticleDto[]) { //data nam je niz kategorija
        const articles:ArticleType[] = data.map(article => { //taj niz mapiramo - za svaku kategoriju koju smo ucitali vracamo objekat
            return {
                articleId: article.articleId,
                name: article.name,
                excerpt: article.excerpt,
                description: article.description,
                imageUrl: article.photos[0].imagePath,
                pdfUrl: article.documentations[0].pdfPath,
                price: article.articlePrices[article.articlePrices.length-1].price,
                status: article.status,
                isPromoted: article.isPromoted,
                articleFeatures: article.articleFeatures,
                features: article.features,
                articlePrices: article.articlePrices,
                photos: article.photos,
                documentations: article.documentations,
                category: article.category,
                categoryId: article.categoryId,
            };
        });

        const newState = Object.assign(this.state, {
            articles: articles,
        });

        this.setState(newState);
    }

	render(){
		return (
			<Container className="mb-3" style={{minHeight: "150px"}}>
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faListAlt } /> Proizvodi
                        </Card.Title>   
                            { this.mainCategories() }         
                    </Card.Body>
                </Card>
            </Container>
		);
    }
    
    private mainCategories(){
        return (
            <Tabs defaultActiveKey="Manometri" id="products-tabs" className="ml-0 mb-0 w-23">
                {this.state.categories.filter(category => category.parentCategoryId === null).map( category =>
                    <Tab eventKey= {category.name} title= {category.name} tabClassName="mb-2">
                        {this.renderSubcategories(category.categoryId) }
                    </Tab>)
                }        
            </Tabs>   
        );
    }

    renderSubcategories(categoryId: number | undefined) {
        return(
        <Tabs>
            {this.state.categories.filter(category => category.parentCategoryId !== null && category.parentCategoryId === categoryId).map( category =>
                    <Tab eventKey= {category.name} title= {category.name} tabClassName="mb-3">
                         { this.renderArticlesOfSubcategory(category.categoryId) }
                    </Tab>)
                }   
        </Tabs>
        );
    }

    private renderArticlesOfSubcategory(categoryId: number | undefined) {
        return(
            <Row>
            
                        {this.state.articles?.filter(article => article.categoryId === categoryId).map(article => (
                            <Col lg="4" md="6" sm="6" xs="12" >
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
                                        
                                    <Link to={`/user/login` }
                                          className="btn btn-primary btn-block btn-sm" id="buttonLink">
                                        Detaljnije o artiklu
                                    </Link>
                                </Card.Body>
                            </Card>
                            </Col>
                        ), this) }
            </Row>
        );
    }
}

export default HomePageArticles;
