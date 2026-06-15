describe('Download de PDF com Criptografia', () => {
  beforeEach(() => {
    cy.login('admin@educatoris.com', 'admin123');
    cy.visit('/');
  });

  it('deve ter plano com acesso a download', () => {
    cy.get('[data-testid="user-plan"]').then(($el) => {
      cy.log('Plano atual: ' + $el.text());
    });
  });

  it('deve exibir botão de download para material arquivo', () => {
    cy.contains(/1º ano/i).click();
    cy.wait(500);

    cy.contains(/tema/i).first().click();
    cy.wait(500);

    cy.get('[data-testid="material-card"]')
      .contains(/arquivo|pdf/i)
      .parent()
      .within(() => {
        cy.contains(/download|baixar/i).should('be.visible');
      });
  });

  it('deve bloquear download sem plano adequado', () => {
    cy.intercept('GET', '**/materiais/*/download', {
      statusCode: 403,
      body: { erro: 'Seu plano não permite download de PDF.' },
    });

    cy.contains(/1º ano/i).click();
    cy.wait(500);
    cy.contains(/tema/i).first().click();
    cy.wait(500);

    cy.get('[data-testid="material-card"]')
      .contains(/arquivo/i)
      .parent()
      .contains(/download/i)
      .click();

    cy.wait(500);
    cy.contains(/não permite download|plano/i).should('be.visible');
  });

  it('deve permitir download com plano válido', () => {
    cy.intercept('GET', '**/materiais/*/download', {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: Buffer.from('mock pdf content'),
    });

    cy.contains(/1º ano/i).click();
    cy.wait(500);
    cy.contains(/tema/i).first().click();
    cy.wait(500);

    cy.get('[data-testid="material-card"]')
      .contains(/arquivo/i)
      .parent()
      .contains(/download/i)
      .click({ force: true });

    cy.wait(500);
  });
});
