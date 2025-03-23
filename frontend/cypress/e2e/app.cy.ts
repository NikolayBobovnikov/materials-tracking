describe('Materials Tracking App', () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('/');
    
    // Wait for app to load
    cy.get('h4').contains('Materials Tracking Module', { timeout: 10000 }).should('be.visible');
  });

  it('should load the app successfully', () => {
    // Check that main components are visible
    cy.appIsLoaded();
    
    // No console errors should be present (check browser console)
    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
    });
  });

  it('should validate the invoice form correctly', () => {
    // Test form validation
    cy.testFormValidation();
    
    // Fill in the form with valid data and check form state
    cy.get('input[name="clientGlobalId"]').click();
    cy.get('li[data-value]').first().click();
    
    cy.get('input[name="supplierGlobalId"]').click();
    cy.get('li[data-value]').first().click();
    
    cy.get('input[name="invoiceDate"]').type('2023-05-15');
    cy.get('input[name="baseAmount"]').type('150.75');
    
    // Check that validation errors are gone
    cy.contains('Client is required').should('not.exist');
    cy.contains('Supplier is required').should('not.exist');
    cy.contains('Invoice date is required').should('not.exist');
    cy.contains('Amount is required').should('not.exist');
  });

  it('should display client and debt data correctly', () => {
    // Check that client list is loaded
    cy.contains('Clients').should('be.visible');
    cy.get('table').eq(1).find('tr').should('have.length.at.least', 1);
    
    // Check that debt list is loaded
    cy.contains('Debts').should('be.visible');
    cy.get('table').eq(2).find('tr').should('have.length.at.least', 1);
  });
  
  it('should handle network errors gracefully', () => {
    // Stub network requests to simulate errors
    cy.intercept('POST', '/graphql', {
      statusCode: 500,
      body: { errors: [{ message: 'Internal server error' }] },
    }).as('graphqlError');
    
    // Reload the page with the intercepted request
    cy.reload();
    
    // App should still render and show an appropriate error message
    cy.get('h4').contains('Materials Tracking Module').should('be.visible');
    cy.contains('Error loading data').should('be.visible');
  });
  
  it('should be accessible', () => {
    // Test accessibility
    cy.injectAxe();
    cy.checkA11y();
  });
  
  it('should be responsive on different screen sizes', () => {
    // Test on mobile viewport
    cy.viewport('iphone-6');
    cy.appIsLoaded();
    
    // Elements should be stacked in mobile view
    cy.get('.MuiGrid-container').should('have.css', 'flex-direction', 'column');
    
    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.appIsLoaded();
    
    // Test on large desktop viewport
    cy.viewport(1920, 1080);
    cy.appIsLoaded();
  });
  
  it('should handle form submission correctly', () => {
    // Intercept the GraphQL mutation request
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.query.includes('createMaterialsInvoice')) {
        req.reply({
          data: {
            createMaterialsInvoice: {
              invoice: {
                id: 'test-invoice-id',
                client: { id: 'client-1', name: 'Test Client' },
                supplier: { id: 'supplier-1', name: 'Test Supplier' },
                invoiceDate: '2023-05-15',
                baseAmount: 150.75,
                status: 'PENDING',
              },
              errors: null,
            },
          },
        });
      }
    }).as('createInvoice');
    
    // Fill in the form
    cy.get('input[name="clientGlobalId"]').click();
    cy.get('li[data-value]').first().click();
    
    cy.get('input[name="supplierGlobalId"]').click();
    cy.get('li[data-value]').first().click();
    
    cy.get('input[name="invoiceDate"]').type('2023-05-15');
    cy.get('input[name="baseAmount"]').type('150.75');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the request and check success message
    cy.wait('@createInvoice');
    cy.contains('Invoice created successfully').should('be.visible');
    
    // Form should be reset
    cy.get('input[name="baseAmount"]').should('have.value', '');
  });
}); 