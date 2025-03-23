// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command to check if app has loaded properly
Cypress.Commands.add('appIsLoaded', () => {
  cy.get('h4').contains('Materials Tracking Module').should('be.visible');
  cy.get('form').should('exist');
  cy.get('table').should('exist');
});

// Custom command to test form validation
Cypress.Commands.add('testFormValidation', () => {
  cy.get('button[type="submit"]').click();
  cy.contains('Client is required').should('be.visible');
  cy.contains('Supplier is required').should('be.visible');
  cy.contains('Invoice date is required').should('be.visible');
  cy.contains('Amount is required').should('be.visible');
});

// Custom command to check for accessibility violations
Cypress.Commands.add('checkA11y', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      appIsLoaded(): Chainable<void>;
      testFormValidation(): Chainable<void>;
      checkA11y(context?: string, options?: any): Chainable<void>;
    }
  }
} 