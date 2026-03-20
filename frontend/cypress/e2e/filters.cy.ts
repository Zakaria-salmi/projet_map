/// <reference types="cypress" />

describe('Filtres de recherche', () => {
  const initMapSearch = () => {
    cy.intercept('GET', '**/cities/nearby*', { body: [] }).as('initNearby')
    cy.clickMap()
    cy.wait('@initNearby')
  }

  beforeEach(() => {
    cy.visit('/')
    cy.get('#map').should('be.visible')
  })

  context('Distance maximale', () => {
    it('met à jour l\'affichage quand le slider change', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 200).trigger('input')
      cy.get('.field-value').eq(0).should('contain.text', '200 km')
    })

    it('relance la recherche nearby avec la nouvelle distance', () => {
      initMapSearch()

      cy.intercept('GET', '**/cities/nearby*', (req) => {
        expect(req.query['distance']).to.equal('200')
        req.reply({ body: [] })
      }).as('distanceSearch')

      cy.get('input[type="range"]').eq(0).invoke('val', 200).trigger('input')
      cy.wait('@distanceSearch')
    })

    it('ne lance pas de requête si aucun clic sur la carte préalable', () => {
      let count = 0
      cy.intercept('GET', '**/cities/nearby*', () => { count++ })
      cy.get('input[type="range"]').eq(0).invoke('val', 300).trigger('input')
      cy.wait(700)
      cy.wrap(count).should('equal', 0)
    })
  })

  context('Nombre de villes', () => {
    it('met à jour l\'affichage quand le slider change', () => {
      cy.get('input[type="range"]').eq(1).invoke('val', 25).trigger('input')
      cy.get('.field-value').eq(1).should('contain.text', '25')
    })

    it('relance la recherche nearby avec la nouvelle limite', () => {
      initMapSearch()

      cy.intercept('GET', '**/cities/nearby*', (req) => {
        expect(req.query['limit']).to.equal('25')
        req.reply({ body: [] })
      }).as('limitSearch')

      cy.get('input[type="range"]').eq(1).invoke('val', 25).trigger('input')
      cy.wait('@limitSearch')
    })
  })

  context('Population minimale', () => {
    it('relance la recherche nearby avec la population minimale', () => {
      initMapSearch()

      cy.intercept('GET', '**/cities/nearby*', (req) => {
        expect(req.query['minPopulation']).to.equal('50000')
        req.reply({ body: [] })
      }).as('popSearch')

      cy.get('input[type="number"]').clear().type('50000')
      cy.wait('@popSearch')
    })

    it('ne lance pas de requête si aucun clic sur la carte préalable', () => {
      let count = 0
      cy.intercept('GET', '**/cities/nearby*', () => { count++ })
      cy.get('input[type="number"]').clear().type('50000')
      cy.wait(700)
      cy.wrap(count).should('equal', 0)
    })
  })

  context('Région', () => {
    it('le sélecteur contient plus de 5 régions', () => {
      cy.get('select option').should('have.length.greaterThan', 5)
    })

    it('relance la recherche nearby avec la région sélectionnée', () => {
      initMapSearch()

      cy.intercept('GET', '**/cities/nearby*', (req) => {
        expect(req.query['region']).to.equal('Bretagne')
        req.reply({ body: [] })
      }).as('regionSearch')

      cy.get('select').select('Bretagne')
      cy.wait('@regionSearch')
    })

    it('ne lance pas de requête si aucun clic sur la carte préalable', () => {
      let count = 0
      cy.intercept('GET', '**/cities/nearby*', () => { count++ })
      cy.get('select').select('Bretagne')
      cy.wait(700)
      cy.wrap(count).should('equal', 0)
    })
  })

  context('Combinaison de filtres', () => {
    it('envoie tous les filtres actifs dans une seule requête', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 200).trigger('input')
      cy.get('input[type="range"]').eq(1).invoke('val', 20).trigger('input')
      cy.get('input[type="number"]').clear().type('10000')
      cy.get('select').select('Bretagne')

      cy.intercept('GET', '**/cities/nearby*', (req) => {
        expect(req.query['distance']).to.equal('200')
        expect(req.query['limit']).to.equal('20')
        expect(req.query['minPopulation']).to.equal('10000')
        expect(req.query['region']).to.equal('Bretagne')
        req.reply({ body: [] })
      }).as('fullSearch')

      cy.clickMap()
      cy.wait('@fullSearch')
    })
  })
})
