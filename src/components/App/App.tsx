import React from 'react';
import './App.css';
import { Container } from 'react-bootstrap';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() { //funkcionalna komponenta - vraca ono sto treba da bude renderovano
  return (
    <Container>
      <FontAwesomeIcon icon= { faHome } /> Home
    </Container>
  );
}

export default App;
