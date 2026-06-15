Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains('button', /login|entrar/i).click();
    cy.url().should('not.include', '/login');
  });
  cy.visit('/');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@educatoris.com', 'admin123');
});

Cypress.Commands.add('loginAsProfessor', (email = 'professor@example.com', password = 'password123') => {
  cy.login(email, password);
});

Cypress.Commands.add('selectPlano', (anoEscolar) => {
  cy.get('select, [role="combobox"]').first().click();
  cy.contains(new RegExp(anoEscolar, 'i')).click();
  cy.wait(300);
});
