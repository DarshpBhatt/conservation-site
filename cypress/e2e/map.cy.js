describe('Sitemap (Map) page', () => {
  it('loads the map and shows trail markers', () => {
    cy.visit('/sitemap'); // adjust if route is different

    cy.get('.leaflet-container').should('exist');

    cy.contains('Overview').should('exist');
    cy.contains('Trail').should('exist');

    // Scroll to it and click even if overlapped
    cy.contains('Trail')
      .scrollIntoView()
      .click({ force: true });

    cy.get('.custom-div-icon')
      .its('length')
      .should('be.greaterThan', 0);
  });
});

