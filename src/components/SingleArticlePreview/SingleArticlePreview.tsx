import React from 'react';
import { Card, Col, Button, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ApiConfig } from '../../config/api.config';
import ArticleType from '../../types/ArticleType';
import api, { ApiResponse } from '../../api/api';
import addToCartInput from '../AddToCartInput/AddToCartInput';
import AddToCartInput from '../AddToCartInput/AddToCartInput';

interface SingleArticlePreviewProperties {
    article: ArticleType,
}

export default class SingleArticlePreview extends React.Component<SingleArticlePreviewProperties> {

    constructor(props: SingleArticlePreviewProperties | Readonly<SingleArticlePreviewProperties>) {
        super(props);
    }

    render() {
        return (
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="mb-3"> 
                    <Card.Header>
                        <img alt={ this.props.article.name }
                             src={ ApiConfig.PHOTO_PATH + 'small/' + this.props.article.imageUrl } 
                             className="w-100"
                             />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title as="p">
                            <strong>{ this.props.article.name }</strong>
                        </Card.Title>
                        <Card.Text>
                            { this.props.article.excerpt }
                        </Card.Text>
                        <Card.Text>
                            Cena : { Number(this.props.article.price).toFixed(2) } DIN
                        </Card.Text>
                        
                        <AddToCartInput article={ this.props.article } />

                        <Link to={`/article/${ this.props.article.articleId }` }
                              className="btn btn-primary btn-block btn-sm" style={ {backgroundColor: '#3c1361', border: 'none'} }>
                            Detaljnije o artiklu
                        </Link>
                    </Card.Body>
                </Card>
            </Col>
        );
    }
}