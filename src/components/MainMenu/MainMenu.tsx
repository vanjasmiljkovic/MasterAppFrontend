import React from 'react';
import { Nav } from 'react-bootstrap';
import { HashRouter, Link } from 'react-router-dom';
import { ApiConfig } from '../../config/api.config';
import Cart from '../Cart/Cart';
import './MainMenu.css';

export class MainMenuItem {
    text: string = '';
    link: string = '#';

    constructor(text: string, link: string) {
        this.text = text;
        this.link = link;
    }
}

interface MainMenuProperties {
    items: MainMenuItem[];
    showCart?: boolean;
}

interface MainMenuState {
    items: MainMenuItem[];
}

export class MainMenu extends React.Component<MainMenuProperties> {
    state: MainMenuState;

    constructor(props: Readonly<MainMenuProperties>) {
        super(props);
        //stanja
        this.state = {
            items: props.items, //to mu je pocetno stanje
        };

    }

    setItems(items: MainMenuItem[]) { //ako neko pozove setItems i da neke druge item-e
        this.setState({
            items: items, //setovacemo umesto pocetnog stanja da dobije prosledjen items 
        });
    }

    render() {
        return (
            <Nav variant="tabs" id="nav">
                <img src={ApiConfig.PHOTO_PATH + 'logo.png'}/>
                <HashRouter>
                    { this.state.items.map(this.makeNavLink) }
                    { this.props.showCart ? <Cart/> : '' }
                </HashRouter>
            </Nav>
        );
    }

    private makeNavLink(item: MainMenuItem) {
        return (
            <Link to={ item.link } id="navItem" className="nav-link">
                { item.text }
            </Link>
        );
    }
}
