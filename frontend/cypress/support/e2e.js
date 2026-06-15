import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
});
