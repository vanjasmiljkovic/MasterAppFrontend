import React from 'react';
import CartType from '../../types/CartType';
import api, { ApiResponse } from '../../api/api';
import { Alert, Button, Form, Modal, Nav, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartArrowDown, faMinusSquare } from '@fortawesome/free-solid-svg-icons';

interface CartState {
    count: number;
    cart?: CartType;
    visible: boolean;
    message: string;
    cartMenuColor: string;
}

export default class Cart extends React.Component {
    state: CartState;

    constructor(props: {} | Readonly<{}>){
        super(props);

        this.state = {
            count: 0,
            visible: false,
            message: '',
            cartMenuColor: '#000000'
        };
    }

    //kada se montira komponenta
    componentDidMount() {
        this.updateCart();
        window.addEventListener("cart.update", () => this.updateCart());
    }

    componentWillUnmount() {
        window.removeEventListener("cart.update", () => this.updateCart());
    }

    private setStateCount(newCount: number) {
        this.setState(Object.assign(this.state, {count: newCount} ));
    }

    private setStateCart(newCart?: CartType) {
        this.setState(Object.assign(this.state, {cart: newCart} ));
    }

    private setStateVisible(newState: boolean) {
        this.setState(Object.assign(this.state, {visible: newState} ));
    }

    private setStateMessage(newMessage: string) {
        this.setState(Object.assign(this.state, {message: newMessage} ));
    }

    private setStateMenuColor(newColor: string) {
        this.setState(Object.assign(this.state, {cartMenuColor: newColor} ));
    }

    private showCart() {
        this.setStateVisible(true);
    }

    private hideCart() {
        this.setStateMessage('');
        this.setStateVisible(false);
    }

    private updateCart() {
        api('/api/user/cart/', 'get', {})
            .then((res: ApiResponse) => {
                if (res.status === 'error' || res.status === 'login') {
                    this.setStateCount(0);
                    this.setStateCart(undefined);
                    return;
                }

                this.setStateCart(res.data);
                this.setStateCount(res.data.cartArticles.length);

                this.setStateMenuColor('#7c5295');
                setTimeout(() => this.setStateMenuColor('#000000'), 2000); 
            });
    }

    private calculateSum(): number {
        let sum: number = 0;

        if (this.state.cart === undefined) {
            return sum;
        }else {
            for (const item of this.state.cart.cartArticles) {
                sum += item.article.articlePrices[item.article.articlePrices.length-1].price * item.quantity;
            }
        }

        return sum;
    }

    private sendCartUpdate(data: any) {
        api('/api/user/cart/', 'patch', data)
            .then((res: ApiResponse) => {
                if (res.status === 'error' || res.status === 'login') {
                    this.setStateCount(0);
                    this.setStateCart(undefined);
                    return;
                }

                this.setStateCart(res.data);
                this.setStateCount(res.data.cartArticles.length);
            });
    }

    private updateQuantity(event: React.ChangeEvent<HTMLInputElement>) {
        const articleId = event.target.dataset.articleId;
        const newQuantity = event.target.value;

        const data = {
            articleId: Number(articleId),
            quantity: Number(newQuantity),
        };

        this.sendCartUpdate(data);
    }

    private removeFromCart(articleId: number) {
        const data = {
            articleId: Number(articleId),
            quantity: 0,
        };

        this.sendCartUpdate(data);
    }

    private makeOrder() {
        api('/api/user/cart/makeOrder/', 'post', {})
            .then((res: ApiResponse) => {
                if (res.status === 'error' || res.status === 'login') {
                    this.setStateCount(0);
                    this.setStateCart(undefined);
                    return;
                }

                this.setStateMessage('Vasa porudzbina je kreirana!');

                this.setStateCart(undefined);
                this.setStateCount(0); //opet dobijamo praznu korpu
            });
    }

    render() {
        const sum = this.calculateSum();

        return (
            <>
                <Nav.Item>
                    <Nav.Link active={ false } onClick={ () => this.showCart() }
                                style={ {color: this.state.cartMenuColor} }>
                    <FontAwesomeIcon icon= { faCartArrowDown } /> ({ this.state.count })
                    </Nav.Link>
                </Nav.Item>

                <Modal size="lg" centered show={ this.state.visible } onHide={ () => this.hideCart() }>
                    <Modal.Header closeButton>
                        <Modal.Title>Vasa Korpa</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table hover size="sm">
                            <thead>
                                <tr>
                                    <th>Kategorija</th>
                                    <th>Proizvod</th>
                                    <th>Kolicina</th>
                                    <th>Cena</th>
                                    <th>Ukupno</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.cart?.cartArticles.map(cartArticle => {
                                    const price = Number(cartArticle.article.articlePrices[cartArticle.article.articlePrices.length-1].price ).toFixed(2);
                                    const total = Number(cartArticle.article.articlePrices[cartArticle.article.articlePrices.length-1].price * cartArticle.quantity).toFixed(2);
                                    return(
                                        <tr>
                                            <td>{ cartArticle.article.category.name }</td>
                                            <td>{ cartArticle.article.name }</td>
                                            <td className="text-right">
                                                <Form.Control type="number" step="1" min="1"
                                                              value={ cartArticle.quantity }
                                                              data-article-id={ cartArticle.article.articleId }
                                                              onChange={ (e) => this.updateQuantity(e as any) } />
                                                
                                            </td>
                                            <td className="text-right">{ price } DIN</td>
                                            <td className="text-right">{ total } DIN</td>
                                            <td>
                                                <FontAwesomeIcon 
                                                    icon={ faMinusSquare}
                                                    onClick={ () => this.removeFromCart(cartArticle.articleId) }/>
                                            </td>
                                        </tr>
                                    )
                                }, this) }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>  
                                    <td className="text-right">
                                        <strong>Ukupan iznos: </strong>
                                    </td>
                                    <td className="text-right">{ Number(sum).toFixed(2) } DIN</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </Table>

                        <Alert variant="success" className={ this.state.message ? '' : 'd-none' }>
                            { this.state.message }
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={ () => this.makeOrder()} 
                                disabled={ this.state.cart?.cartArticles.length === 0 }>
                            Poruci
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}