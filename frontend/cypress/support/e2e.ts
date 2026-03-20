/// <reference types="cypress" />

import './commands'

beforeEach(() => {
  cy.intercept('GET', 'https://*.tile.openstreetmap.org/**', { statusCode: 200, body: '' })
})
