import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Ecology from '../../src/components/Ecology';

describe('Ecology component', () => {
  it('renders basic content', () => {
    cy.mount(
      <MemoryRouter>
        <Ecology />
      </MemoryRouter>
    );

    cy.contains('Species you may encounter').should('exist');
    cy.contains('Category').should('exist');
    cy.contains('Results').should('exist');
  });
});

