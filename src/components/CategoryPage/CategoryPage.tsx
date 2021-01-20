import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Card, Container } from 'react-bootstrap';
import CategoryType from '../../types/CategoryType';

interface CategoryPageProperties {
    match: { //izvlacenje iz URL-a
        params: { //parametara
            cId: number; //konkretno parametar se zove cId - tako se zove u ruti
        }
    }
}

//ocekuje da u sebi sadrzi category tipa CategoryType
interface CategoryPageState {
    category?: CategoryType;
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {

    state: CategoryPageState; //state je tipa CategoryPageState

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);

        this.state = { }; //state je inicijalno prazan
    }

    render(){
        return (
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                        <FontAwesomeIcon icon= { faListAlt } /> { this.state.category?.name}  {/*ako postoji category ispisi njegovo ime */}
                        </Card.Title>
                        <Card.Text>
                            Here we will have our articles ...
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    //izvrsava se samo kada se prvi put montira 
    componentWillMount() {
        this.getCategoryData();
    }

    //ako novi properti su isti kao i stari prekidam dalji rad - vec ucitana stranica i neko opet klikne na nju, 
    //nema razloga bilo sta da se menja, tek kada promeni i klikne Category 7 npr, a trenutno je Cateogry 1 tada ce biti pozvana metoda getCategoryId
    componentWillReceiveProps(newProperties: CategoryPageProperties) {
        if (newProperties.match.params.cId === this.props.match.params.cId) { 
            return; 
        }
        this.getCategoryData();
    }

    //doprema podatke i setuje ih kao state ove komponente
    private getCategoryData() {
        setTimeout(() => {
            const data: CategoryType = {
                name: 'Category ' + this.props.match.params.cId,
                categoryId: this.props.match.params.cId,
                items: []
            };

            this.setState({
                category: data,
            })
        }, 750);
    }
}