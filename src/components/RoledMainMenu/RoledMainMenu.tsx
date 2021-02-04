import React from 'react';
import { MainMenu, MainMenuItem } from '../MainMenu/MainMenu';

interface RoledMainMenuProperties {
    role: 'user' | 'administrator' | 'visitor'
}

export default class RoledMainMenu extends React.Component<RoledMainMenuProperties> {
    render() {
        let items: MainMenuItem[] = [];

        switch (this.props.role) {
            case 'visitor'       : items = this.getVisitorMenuItems(); break;
            case 'user'          : items = this.getUserMenuItems(); break;
            case 'administrator' : items = this.getAdministratorMenuItems(); break;
        }

        let showCart = false;

        if (this.props.role === 'user') {
            showCart = true;
        }

        return <MainMenu items= { items } showCart={ showCart } />
    }

    getUserMenuItems(): MainMenuItem[]{
        return[
            new MainMenuItem("Pocetna strana", "/"),
            new MainMenuItem("Kontakt", "/contact/"),
            new MainMenuItem("O nama", "/about-us/"), //implementiraj
            new MainMenuItem("Proizvodi", "/categories"), //implementiraj padajuci meni da ima kategorije
            new MainMenuItem("Moje porudzbine", "/user/orders"), 
            new MainMenuItem("Log out", "/user/logout/"),
        ];
    }

    getAdministratorMenuItems(): MainMenuItem[]{
        return[
            new MainMenuItem("Administrator panel", "/administrator/dashboard/"),
            new MainMenuItem("Log out", "/administrator/logout/"),
        ];
    }

    getVisitorMenuItems(): MainMenuItem[]{
        return[
            new MainMenuItem("Pocetna strana", "/"),
            new MainMenuItem("Kontakt", "/contact/"),
            new MainMenuItem("O nama", "/about-us/"), //implementiraj
            new MainMenuItem("Proizvodi", "/products"), //implementiraj padajuci meni da ima kategorije 
            new MainMenuItem("User Log in", "/user/login/"),
            new MainMenuItem("Administrator Log in", "/administrator/login/"),
            new MainMenuItem("Registracija", "/user/register/"),

        ];
    }
}