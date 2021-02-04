import { faBoxOpen, faCartArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Card, Container, Modal, Tab, Table, Tabs } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import ApiOrderDto from '../../dtos/ApiOrderDto';
import CartType from '../../types/CartType';
import OrderType from '../../types/OrderType';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface AdministratorDashboardOrderState {
    isAdministratorLoggedIn: boolean;
    cartVisible: boolean;
    orders: ApiOrderDto[];
    cart?: CartType;
}

export default class AdministratorDashboardOrder extends React.Component {    
    state: AdministratorDashboardOrderState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            isAdministratorLoggedIn: true,
            cartVisible: false,
            orders: [],
        };
    }

    private setOrders(orders: ApiOrderDto[]) {
        const newState = Object.assign(this.state, {
            orders: orders,
        });

        this.setState(newState);
    }

    private setLoginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isAdministratorLoggedIn: isLoggedIn,
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

    private hideCart() {
        this.setCartVisibleState(false);
    }

    private showCart() {
        this.setCartVisibleState(true);
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

    reloadOrders() {
        api('/api/order', 'get', {}, 'administrator')
            .then((res:ApiResponse) => {
                if (res.status === "error" || res.status === "login") {
                    this.setLoginState(false);
                    return;
                }

                const data: ApiOrderDto[] = res.data;

                this.setOrders(data); //dopremljene podatke - porudzbine - smo setovali u state
            });
    }

    componentDidMount() {
       this.reloadOrders();
    }  

    changeStatus(orderId: number, newStatus: "pending" | "rejected" | "accepted" | "shipped") {
        api('/api/order/' + orderId, 'patch', {newStatus}, 'administrator')
        .then((res:ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setLoginState(false);
                return;
            }

            this.reloadOrders();
        });
    }

    private setAndShowCart(cart: CartType) {
        this.setCartState(cart);
        this.showCart();
    }

    renderOrders(withStatus: "pending" | "rejected" | "accepted" | "shipped") {
        return (
            <Table hover size="sm" bordered>
                <thead>
                    <tr>
                        <th className="text-right pr-2">ID porudzbine</th>
                        <th>Datum</th>
                        <th>Pregled porudzbine</th>
                        <th>Promena statusa porudzbine</th>
                    </tr>
                </thead>
                <tbody>
                    { this.state.orders.filter(order => order.status === withStatus).map(order => (
                        <tr>
                            <td className="text-right pr-2">{ order.orderId }</td>
                            <td>{ order.createdAt.substring(0,19).replace('T', ' ') }</td>
                            <td>
                            <Button size="sm" variant="primary"
                                    onClick={ () => this.setAndShowCart(order.cart) }>
                                <FontAwesomeIcon icon = { faBoxOpen } />
                            </Button>
                            </td>
                            <td className="ml-1">
                                { this.printStatusChangedButtons(order) }
                            </td>
                        </tr>
                    ), this) }
                </tbody>
            </Table>
        ); 
    }

    render(){
        if (this.state.isAdministratorLoggedIn === false) {
            return (
                <Redirect to="/administrator/login"/>
            );
        }

        const sum = this.calculateSum();

		return (
			<Container>
                <RoledMainMenu role="administrator" />
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faCartArrowDown } /> Porudzbine
                        </Card.Title>

                        <Tabs defaultActiveKey="pending" id="order-tabs" className="ml-0 mb-0">
                            <Tab eventKey="pending" title="U obradi">
                                { this.renderOrders("pending") }
                            </Tab>
                            <Tab eventKey="accepted" title="Prihvacene">
                                { this.renderOrders("accepted") }
                            </Tab>
                            <Tab eventKey="shipped" title="Poslate">
                                { this.renderOrders("shipped") }
                            </Tab>
                            <Tab eventKey="rejected" title="Odbijene">
                                { this.renderOrders("rejected") }
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>

                <Modal size="lg" centered show={ this.state.cartVisible } onHide={ () => this.hideCart() }>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalji porudzbine</Modal.Title>
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

    printStatusChangedButtons(order: OrderType) {
        if (order.status === 'pending') {
            return (
                <>
                    <Button type="button" variant="primary" size="sm" className="mr-1"
                        onClick={ () => this.changeStatus(order.orderId, 'accepted') }>Prihvacena</Button>
                    <Button type="button" variant="danger" size="sm"
                    onClick={ () => this.changeStatus(order.orderId, 'rejected') }>Odbijena</Button>
                </>
            );
        }

        if (order.status === 'accepted') {
            return (
                <>
                    <Button type="button" variant="primary" size="sm" className="mr-1"
                    onClick={ () => this.changeStatus(order.orderId, 'shipped') }>Poslata</Button>
                    <Button type="button" variant="secondary" size="sm"
                    onClick={ () => this.changeStatus(order.orderId, 'pending') }>Vrati u obradu</Button>
                </>
            );
        }

        if (order.status === 'shipped') {
            return (
                <>
                </>
            );
        }

        if (order.status === 'rejected') {
            return (
                <>
                    <Button type="button" variant="secondary" size="sm"
                    onClick={ () => this.changeStatus(order.orderId, 'pending') }>Vrati u obradu</Button>
                </>
            );
        }
    }
}