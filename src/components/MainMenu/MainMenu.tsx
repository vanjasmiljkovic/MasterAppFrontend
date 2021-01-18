import React from 'react';
import { Container, Nav } from 'react-bootstrap';

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
                    { this.state.items.map(this.makeNavLink) }
                </Nav>
            </Container>
        );
    }

    private makeNavLink(item: MainMenuItem) {
        return (
            <Nav.Link href={ item.link }>
                { item.text }
            </Nav.Link>
        );
    }
}
