import React from 'react';
import { Container, Nav } from 'react-bootstrap';
import { HashRouter, Link } from 'react-router-dom';

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
            <Container>
                <Nav variant="tabs">
                    <HashRouter>
                        { this.state.items.map(this.makeNavLink) }
                    </HashRouter>
                </Nav>
            </Container>
        );
    }

    private makeNavLink(item: MainMenuItem) {
        return (
            <Link to={ item.link } className="nav-link">
                { item.text }
            </Link>
        );
    }
}
