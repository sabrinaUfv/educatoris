describe('Professor - Navegação de Conteúdos', () => {
  beforeEach(() => {
    cy.login('admin@educatoris.com', 'admin123');
    cy.visit('/');
  });

  it('deve listar anos escolares disponíveis', () => {
    cy.contains(/1º ano|2º ano|3º ano/i).should('be.visible');
  });

  it('deve exibir temas ao selecionar um ano', () => {
    cy.contains(/1º ano/i).click();
    cy.wait(500);
    cy.contains(/tema|conteúdo|matéria/i).should('be.visible');
  });

  it('deve buscar conteúdo por termo com normalização de acentos', () => {
    cy.get('input[placeholder*="busca" i]').type('acido');
    cy.wait(500);

    cy.contains(/ácido|acido/i).should('be.visible');
  });

  it('deve exibir materiais ao selecionar um tema', () => {
    cy.contains(/tema/i).first().click();
    cy.wait(500);

    cy.contains(/arquivo|vídeo|laboratório/i).should('be.visible');
  });

  it('deve exibir informações do material', () => {
    cy.get('[data-testid="material-card"]').first().click();
    cy.wait(500);

    cy.contains(/título|descrição|autor/i).should('be.visible');
  });
});
