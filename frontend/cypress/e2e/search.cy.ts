/// <reference types="cypress" />

describe('Recherche par nom', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('affiche les résultats après une recherche', () => {
    cy.intercept('GET', '**/cities/search*', {
      body: [
        { id: 1, name: 'Paris', population: 2161000, region: 'Île-de-France', lat: 48.8566, lng: 2.3522 },
        { id: 2, name: 'Paris-Le Bourget', population: 26000, region: 'Île-de-France', lat: 48.9562, lng: 2.4415 },
      ],
    }).as('search')

    cy.get('.search-input').type('Paris')
    cy.wait('@search')

    cy.get('.city-list').should('be.visible')
    cy.get('.city-item').should('have.length', 2)
  })

  it('affiche le nom de la ville dans les résultats', () => {
    cy.intercept('GET', '**/cities/search*', {
      body: [{ id: 3, name: 'Lyon', population: 513000, region: 'Auvergne-Rhône-Alpes', lat: 45.76, lng: 4.84 }],
    }).as('search')

    cy.get('.search-input').type('Lyon')
    cy.wait('@search')

    cy.get('.city-item').first().find('.city-name').should('contain.text', 'Lyon')
  })

  it('affiche la région dans les résultats', () => {
    cy.intercept('GET', '**/cities/search*', {
      body: [{ id: 3, name: 'Lyon', population: 513000, region: 'Auvergne-Rhône-Alpes', lat: 45.76, lng: 4.84 }],
    }).as('search')

    cy.get('.search-input').type('Lyon')
    cy.wait('@search')

    cy.get('.city-item').first().find('.city-region').should('contain.text', 'Auvergne-Rhône-Alpes')
  })

  it('affiche la population (avec "hab.")', () => {
    cy.intercept('GET', '**/cities/search*', {
      body: [{ id: 3, name: 'Lyon', population: 513000, region: 'Auvergne-Rhône-Alpes', lat: 45.76, lng: 4.84 }],
    }).as('search')

    cy.get('.search-input').type('Lyon')
    cy.wait('@search')

    cy.get('.city-item').first().find('.city-pop').should('contain.text', 'hab.')
  })

  it('n\'affiche pas de distance pour une recherche par nom', () => {
    cy.intercept('GET', '**/cities/search*', {
      body: [{ id: 3, name: 'Lyon', population: 513000, region: 'Auvergne-Rhône-Alpes', lat: 45.76, lng: 4.84 }],
    }).as('search')

    cy.get('.search-input').type('Lyon')
    cy.wait('@search')

    cy.get('.city-item').first().find('.city-dist').should('not.exist')
  })

  it('affiche le compteur "1 ville" au singulier', () => {
    cy.intercept('GET', '**/cities/search*', {
      body: [{ id: 3, name: 'Lyon', population: 513000, region: 'Auvergne-Rhône-Alpes', lat: 45.76, lng: 4.84 }],
    }).as('search')

    cy.get('.search-input').type('Lyon')
    cy.wait('@search')

    cy.get('.result-count').should('contain.text', '1 ville')
  })

  it('affiche le compteur "N villes" au pluriel', () => {
    cy.intercept('GET', '**/cities/search*', {
      body: [
        { id: 1, name: 'Paris', population: 2161000, region: 'Île-de-France', lat: 48.86, lng: 2.35 },
        { id: 2, name: 'Paris-Le Bourget', population: 26000, region: 'Île-de-France', lat: 48.96, lng: 2.44 },
      ],
    }).as('search')

    cy.get('.search-input').type('Paris')
    cy.wait('@search')

    cy.get('.result-count').should('contain.text', '2 villes')
  })

  it('affiche "Aucune ville trouvée" si l\'API renvoie un tableau vide', () => {
    cy.intercept('GET', '**/cities/search*', { body: [] }).as('search')

    cy.get('.search-input').type('xyznotacity')
    cy.wait('@search')

    cy.get('.hint').should('contain.text', 'Aucune ville trouvée')
    cy.get('.city-list').should('not.exist')
  })

  it('affiche un message d\'erreur si le serveur est indisponible', () => {
    cy.intercept('GET', '**/cities/search*', { forceNetworkError: true }).as('search')

    cy.get('.search-input').type('Paris')
    cy.wait('@search')

    cy.get('.error-msg').should('contain.text', 'Impossible de contacter le serveur')
  })

  it('affiche le spinner pendant le chargement', () => {
    cy.intercept('GET', '**/cities/search*', (req) => {
      req.on('response', (res) => { res.setDelay(800) })
      req.reply({ body: [] })
    }).as('search')

    cy.get('.search-input').type('Paris')
    cy.get('.spinner').should('be.visible')
    cy.wait('@search')
  })

  it('envoie le paramètre "name" correct à l\'API', () => {
    cy.intercept('GET', '**/cities/search*', (req) => {
      expect(req.query['name']).to.equal('Bordeaux')
      req.reply({ body: [] })
    }).as('search')

    cy.get('.search-input').type('Bordeaux')
    cy.wait('@search')
  })

  it('envoie le paramètre "limit" à l\'API (valeur par défaut : 10)', () => {
    cy.intercept('GET', '**/cities/search*', (req) => {
      expect(req.query['limit']).to.equal('10')
      req.reply({ body: [] })
    }).as('search')

    cy.get('.search-input').type('Nantes')
    cy.wait('@search')
  })

  it('ne déclenche pas de requête si le champ est vide', () => {
    let callCount = 0
    cy.intercept('GET', '**/cities/search*', () => { callCount++ })

    // Type then immediately clear — watcher fires with '' and returns early
    cy.get('.search-input').type('a').clear()
    cy.wait(700) // > debounce (400ms)
    cy.wrap(callCount).should('equal', 0)
  })
})
