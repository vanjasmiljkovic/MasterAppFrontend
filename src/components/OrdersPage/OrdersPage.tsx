import { faBox, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card, Container, Modal, Table } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import CartType from '../../types/CartType';
import OrderType from '../../types/OrderType';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface OrdersPageState {
    isUserLoggedIn: boolean;
    orders: OrderType[];
    cartVisible: boolean;
    cart?: CartType;
}

interface OrderDto {
    orderId: number;
    createdAt: string;
    status: "rejected" | "accepted" | "shipped" | "pending";
    cart: {
        cartId: number;
        createdAt: string;
        cartArticles: {
            quantity: number;
            article: {
                articleId: number;
                name: string;
                excerpt: string;
                status: "available" | "visible" | "hidden"
                isPromoted: number;
                category: {
                    categoryId: number;
                    name: string;
                },
                articlePrices: {
                    createdAt: string;
                    price: number;
                }[];
                photos: {
                   imagePath: string; 
                }[];
            }
        }[];
    };
}

export default class OrdersPage extends React.Component {
    state: OrdersPageState;

    constructor(props: {} | Readonly<{}>){
        super(props);

        this.state = {
            isUserLoggedIn: true,
            orders: [],
            cartVisible: false,
        }
    }
    private setLoginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isUserLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setCartVisibleState(state: boolean) {
        const newState = Object.assign(this.state, {
            cartVisible: state,
        });

        this.setState(newState);
    }

    private setCartState(cart: CartType) {
        const newState = Object.assign(this.state, {
            cart: cart,
        });

        this.setState(newState);
    }

    private setOrdersState(orders: OrderType[]) {
        const newState = Object.assign(this.state, {
            orders: orders,
        });

        this.setState(newState);
    }

    private hideCart() {
        this.setCartVisibleState(false);
    }

    private showCart() {
        this.setCartVisibleState(true);
    }

    componentDidMount() {
        this.getOrders();
    }

    componentDidUpdate() {
        this.getOrders();
    }

    private getOrders() {
        api('/api/user/cart/orders', 'get', {})
            .then((res: ApiResponse) => {
                if (res.status === 'error' || res.status === 'login') {
                    this.setLoginState(false);
                }

                const data: OrderDto[] = res.data;

                const orders: OrderType[] = data.map(order => ({
                    orderId: order.orderId,
                    status: order.status,
                    createdAt: order.createdAt,
                    cart: {
                        cartId: order.cart.cartId,
                        user: null,
                        userId: 0,
                        createdAt: order.cart.createdAt,
                        cartArticles: order.cart.cartArticles.map(ca => ({
                            cartArticleId: 0,
                            articleId: ca.article.articleId,
                            quantity: ca.quantity,
                            article: {
                                articleId: ca.article.articleId,
                                name: ca.article.name,
                                category: {
                                    categoryId: ca.article.category.categoryId,
                                    name: ca.article.category.name,
                                },
                                articlePrices: ca.article.articlePrices.map(ap => ({
                                    articlePriceId: 0,
                                    createdAt: ap.createdAt,
                                    price: ap.price,
                                }))
                            }
                        }))
                    }
                }));

            this.setOrdersState(orders);
        });
    }

    private getLatestPriceBeforeDate(article: any, latestDate: any) {
        const cartTimestamp = new Date(latestDate).getTime();

        let price = article.articlePrices[0];

            for(let ap of article.articlePrices) {
                const articlePriceTimestamp = new Date(ap.createdAt).getTime();

                if (articlePriceTimestamp < cartTimestamp) {
                    price = ap;
                } else {
                    break;
                }
            }

            return price;
    }

    //uzeti cenu koja je odgovarala datumu kad je korpa napravljena
    private calculateSum(): number {
        let sum: number = 0;

        if (this.state.cart === undefined) {
            return sum;
        } else {
            for (const item of this.state.cart?.cartArticles) {
                let price = this.getLatestPriceBeforeDate(item.article, this.state.cart.createdAt);
                sum += price.price * item.quantity;
            }
        }

        return sum;
    }

    render() {

        if (this.state.isUserLoggedIn === false) {
            return (
                <Redirect to="/user/login"/>
            );
        }

        const sum = this.calculateSum();

        return (
			<Container>
                <RoledMainMenu role="user" />
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faBox } /> Moje porudzbine
                        </Card.Title>
                        <Table hover size="sm">
                            <thead>
                                <tr>
                                    <th>Datum kreiranja</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.orders.map(this.printOrderRow, this) }
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Modal size="lg" centered show={ this.state.cartVisible } onHide={ () => this.hideCart() }>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalji Vase porudzbine</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table hover size="sm">
                            <thead>
                                <tr>
                                    <th>Kategorija</th>
                                    <th>Proizvod</th>
                                    <th className="text-right">Kolicina</th>
                                    <th className="text-right">Cena</th>
                                    <th className="text-right">Ukupno</th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.cart?.cartArticles.map(cartArticle => {
                                    const articlePrice = this.getLatestPriceBeforeDate(cartArticle.article, this.state.cart?.createdAt);

                                    const price = Number(articlePrice.price).toFixed(2);
                                    const total = Number(articlePrice.price * cartArticle.quantity).toFixed(2);

                                    return(
                                        <tr>
                                            <td>{ cartArticle.article.category.name }</td>
                                            <td>{ cartArticle.article.name }</td>
                                            <td className="text-right">{ cartArticle.quantity }</td>
                                            <td className="text-right">{ price } DIN</td>
                                            <td className="text-right">{ total } DIN</td>
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
                                </tr>
                            </tfoot>
                        </Table>
                    </Modal.Body>
                </Modal>
            </Container>
		);
    }

    private setAndShowCart(cart: CartType) {
        this.setCartState(cart);
        this.showCart();
    }

    private printOrderRow(order: OrderType) {
        return (
            <tr>
                <td>{ order.createdAt.substring(0,19).replace('T', ' ') }</td>
                <td>{ order.status }</td>
                <td className="text-right">
                    <Button size="sm" variant="primary"
                            onClick={ () => this.setAndShowCart(order.cart) }>
                            <FontAwesomeIcon icon = { faBoxOpen } />
                    </Button>
                </td>
            </tr>
        );
    }
}