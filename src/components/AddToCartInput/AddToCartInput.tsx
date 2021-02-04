import React from 'react';
import { Card, Col, Button, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ApiConfig } from '../../config/api.config';
import ArticleType from '../../types/ArticleType';
import api, { ApiResponse } from '../../api/api';

interface AddToCartInputProperties {
    article: ArticleType,
}

interface AddToCartInputState {
    quantity: number;
}

export default class AddToCartInput extends React.Component<AddToCartInputProperties> {
    state: AddToCartInputState;

    constructor(props: AddToCartInputProperties | Readonly<AddToCartInputProperties>) {
        super(props);

        this.state = {
            quantity: 1,
        }
    }

    private quantityChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            quantity: Number(event.target.value),
        });
    }

    private addToCart() {
        const data = {
            articleId: this.props.article.articleId,
            quantity: this.state.quantity
        };

        api('/api/user/cart/addToCart/', 'post', data)
            .then((res: ApiResponse) => {
                if (res.status === 'error' || res.status === 'login') {
                    return;
                }

                const event = new CustomEvent('cart.update'); //Cart.tsx
                window.dispatchEvent(event);
            });
    }

    render() {
        return (
            <Form.Group>
                <Row>
                    <Col xs="6"> 
                        <Form.Control type="number" min="1" step="1" value={ this.state.quantity }
                                        onChange={ (e) => this.quantityChanged(e as any) }/>
                    </Col>
                    <Col xs="6">
                        <Button variant="secondary" block
                                onClick={() => this.addToCart()}>Kupi</Button>
                    </Col>
                </Row>
            </Form.Group>
        );
    }
}