import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Homepage from '../../src/components/Homepage';

describe('Homepage component', () => {
  it('renders hero text and main links', () => {
    cy.mount(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );

    // hero heading
    cy.contains('A community forest that keeps local history').should('exist');

    // audio buttons
    cy.contains('Play Audio').should('exist');
    cy.contains('Stop Audio').should('exist');

    // main navigation buttons/links on the hero
    cy.contains('Trail Map').should('exist');
    cy.contains('About').should('exist');
    cy.contains('Ecology').should('exist');
    cy.contains('Contact').should('exist');
  });
});

