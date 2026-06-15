describe('Admin - Gerenciamento de Planos', () => {
  beforeEach(() => {
    cy.login('admin@educatoris.com', 'admin123');
    cy.visit('/admin/planos');
  });

  it('deve exibir página de planos', () => {
    cy.contains(/plano|assinatura/i).should('be.visible');
    cy.contains(/novo plano|criar/i).should('be.visible');
  });

  it('deve listar planos existentes', () => {
    cy.get('[data-testid="plano-card"]').should('have.length.greaterThan', 0);
  });

  it('deve criar novo plano', () => {
    cy.contains(/novo plano|criar plano/i).click();
    cy.wait(300);

    cy.get('input[placeholder*="título" i]').type('Plano Teste');
    cy.get('input[placeholder*="preço" i]').type('49.90');
    cy.get('input[placeholder*="nível" i]').type('2');

    cy.get('input[type="checkbox"]').first().check();

    cy.contains(/salvar|criar/i).click();
    cy.wait(500);

    cy.contains(/sucesso|criado/i).should('be.visible');
  });

  it('deve editar preço de plano existente', () => {
    cy.get('[data-testid="plano-card"]').first().within(() => {
      cy.contains(/editar|editar preço/i).click();
    });
    cy.wait(300);

    cy.get('input[type="number"][value*="29"]').clear().type('39.90');
    cy.contains(/salvar|confirmar/i).click();
    cy.wait(500);

    cy.contains(/atualizado|sucesso/i).should('be.visible');
  });

  it('deve desativar plano existente', () => {
    cy.get('[data-testid="plano-card"]').last().within(() => {
      cy.contains(/desativar|deletar/i).click();
    });
    cy.wait(300);

    cy.contains(/tem certeza|confirmar/i).within(() => {
      cy.contains(/sim|confirmar/i).click();
    });
    cy.wait(500);

    cy.contains(/desativado|sucesso/i).should('be.visible');
  });
});
