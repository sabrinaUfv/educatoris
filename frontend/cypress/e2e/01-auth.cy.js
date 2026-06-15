describe('Fluxo de Autenticação', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('deve exibir página de login', () => {
    cy.contains('Login').should('be.visible');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('deve exibir erro com credenciais inválidas', () => {
    cy.get('input[type="email"]').type('invalido@example.com');
    cy.get('input[type="password"]').type('senhaerrada');
    cy.contains('button', /login|entrar/i).click();

    cy.contains(/incorretos|inválido/i).should('be.visible');
  });

  it('deve fazer login com credenciais válidas', () => {
    cy.get('input[type="email"]').type('admin@educatoris.com');
    cy.get('input[type="password"]').type('admin123');
    cy.contains('button', /login|entrar/i).click();

    cy.url().should('not.include', '/login');
    cy.contains(/bem-vindo|dashboard|painel/i).should('be.visible');
  });

  it('deve fazer logout e retornar para login', () => {
    cy.login('admin@educatoris.com', 'admin123');

    cy.contains('button', /logout|sair/i).click();
    cy.url().should('include', '/login');
  });
});
