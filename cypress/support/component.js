// cypress/support/component.js

import { mount } from 'cypress/react';

// Make cy.mount available in all component tests
Cypress.Commands.add('mount', mount);


