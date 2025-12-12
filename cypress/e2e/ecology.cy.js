describe('Ecology page', () => {
  it('loads with header, audio buttons, filters and results', () => {
    // Open the ecology page by URL
    cy.visit('/ecology'); // if your route is different, change this

    // Header text from your component
    cy.contains('Species you may encounter').should('exist');
    cy.contains(
      "Explore the flora, fauna, and fungi of St. Margaret's Bay."
    ).should('exist');

    // Audio buttons
    cy.contains('Play Audio').should('exist');
    cy.contains('Stop Audio').should('exist');

    // Filter + results panel
    cy.contains('Category').should('exist');
    cy.contains('Results').should('exist');

    // At least one species card (they all show "View photo")
    cy.contains('View photo').should('exist');
  });

  it('filters by category and opens/closes the species modal', () => {
    cy.visit('/ecology');

    // Click on a specific category button.
    // Your labels are "All", plus capitalized keys from ecologydata.json
    // (likely "Flora", "Fauna", "Fungi"). Adjust text here if needed.
    cy.contains('button', 'Flora').click({ force: true });

    // After filtering, we still expect some cards
    cy.contains('View photo').should('exist');

    // Click the first card (any "View photo" badge)
    cy.contains('View photo').first().click();

    // Modal should appear (role="dialog" in your JSX)
    cy.get('[role="dialog"]').should('exist');

    // Close the modal using the close button (has aria-label="Close details")
    cy.get('[aria-label="Close details"]').click();

    // Modal should be gone
    cy.get('[role="dialog"]').should('not.exist');
  });
});

