describe('Homepage', () => {
  it('shows the main hero content and navigation links', () => {
    // Open your homepage
    cy.visit('/');

    // Check the small heading line
    cy.contains("St. Margaret's Bay Area Woodland").should('exist');

    // Check the main hero heading text
    cy.contains(
      'A community forest that keeps local history and coastal birch standing strong.'
    ).should('exist');

    // Check a bit of the welcome paragraph
    cy.contains('French Village Conservation Woodland').should('exist');

    // Check that the main navigation buttons/links exist
    cy.contains('Trail Map').should('exist');
    cy.contains('About').should('exist');
    cy.contains('Ecology').should('exist');
    cy.contains('Contact').should('exist');

    // Check that the core tiles exist (use one of the titles)
    cy.contains('Explore the Conservation Area').should('exist');
    cy.contains('Share & Explore Photos').should('exist');
    cy.contains('Conservation Education').should('exist');
  });
});

