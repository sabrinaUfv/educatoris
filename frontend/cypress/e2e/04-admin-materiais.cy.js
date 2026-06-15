describe('Admin - Gerenciamento de Materiais', () => {
  beforeEach(() => {
    cy.login('admin@educatoris.com', 'admin123');
    cy.visit('/admin/materiais');
  });

  it('deve exibir página de materiais', () => {
    cy.contains(/material|gerenciar/i).should('be.visible');
    cy.contains(/novo material|adicionar/i).should('be.visible');
  });

  it('deve selecionar tema para adicionar material', () => {
    cy.get('select, [role="combobox"]').first().click();
    cy.wait(300);

    cy.contains(/tema|conteúdo/i).first().click();
    cy.wait(300);

    cy.get('table, [role="grid"]').should('be.visible');
  });

  it('deve adicionar novo material', () => {
    cy.get('select, [role="combobox"]').first().click();
    cy.contains(/tema|conteúdo/i).first().click();
    cy.wait(300);

    cy.contains(/novo material|adicionar/i).click();
    cy.wait(300);

    cy.get('input[placeholder*="título" i]').type('Material Teste');
    cy.get('input[placeholder*="url" i]').type('https://example.com/pdf.pdf');

    cy.contains(/cadastrar|salvar/i).click();
    cy.wait(500);

    cy.contains(/sucesso|adicionado/i).should('be.visible');
  });

  it('deve editar material existente', () => {
    cy.get('select, [role="combobox"]').first().click();
    cy.contains(/tema|conteúdo/i).first().click();
    cy.wait(300);

    cy.get('table tr').first().within(() => {
      cy.contains(/editar/i).click();
    });
    cy.wait(300);

    cy.get('input[type="text"]').first().clear().type('Material Atualizado');
    cy.contains(/salvar|atualizar/i).click();
    cy.wait(500);

    cy.contains(/sucesso|atualizado/i).should('be.visible');
  });

  it('deve ocultar material existente', () => {
    cy.get('select, [role="combobox"]').first().click();
    cy.contains(/tema|conteúdo/i).first().click();
    cy.wait(300);

    cy.get('table tr').first().within(() => {
      cy.contains(/ocultar|deletar/i).click();
    });
    cy.wait(500);

    cy.contains(/inativado|sucesso/i).should('be.visible');
  });
});
