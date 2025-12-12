import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../src/components/Footer';

describe('Footer component', () => {
  it('renders sections, links, address and social icons', () => {
    cy.mount(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // section headings
    cy.contains('Plan your visit').should('exist');
    cy.contains('Explore more').should('exist');
    cy.contains('Connect').should('exist');

    // main navigation links
    cy.contains('Maps').should('exist');
    cy.contains('About').should('exist');
    cy.contains('Ecology').should('exist');
    cy.contains('Gallery').should('exist');
    cy.contains('Contact Us').should('exist');
    cy.contains('Natural Burial').should('exist');
    cy.contains('Shop').should('exist');

    // address line
    cy.contains('71 St Pauls Ln, French Village, NS B3Z 2Y1').should('exist');

    // social icons (3 links: Facebook, Instagram, X/Twitter)
    cy.get('a[href="https://facebook.com"]').should('exist');
    cy.get('a[href="https://instagram.com"]').should('exist');
    cy.get('a[href="https://twitter.com"]').should('exist');

    // copyright text
    cy.contains('Woodland Conservation Area').should('exist');
    cy.contains('All rights reserved').should('exist');
  });
});

