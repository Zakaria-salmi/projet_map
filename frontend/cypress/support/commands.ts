/// <reference types="cypress" />

Cypress.Commands.add('clickMap', () => {
  cy.get('#map').then(($map) => {
    const { width, height } = $map[0].getBoundingClientRect()
    cy.get('#map').click(width / 2, height / 2)
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      clickMap(): Chainable<void>
    }
  }
}
