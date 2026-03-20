jest.mock('../services/cityService', () => ({
  searchByName: jest.fn(),
  findNearby: jest.fn(),
}))

const cityService = require('../services/cityService')
const cityController = require('../controllers/cityController')

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

afterEach(() => jest.clearAllMocks())

describe('CityController.search', () => {
  it('retourne 400 si le paramètre name est absent', async () => {
    const req = { query: {} }
    const res = mockRes()

    await cityController.search(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Paramètre name requis' })
  })

  it('retourne 400 si name est une chaîne vide', async () => {
    const req = { query: { name: '   ' } }
    const res = mockRes()

    await cityController.search(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Paramètre name requis' })
  })

  it('retourne les villes pour un nom valide', async () => {
    const mockCities = [{ id: 1, name: 'Paris' }]
    cityService.searchByName.mockResolvedValue(mockCities)
    const req = { query: { name: 'Paris', limit: '5' } }
    const res = mockRes()

    await cityController.search(req, res)

    expect(cityService.searchByName).toHaveBeenCalledWith({ name: 'Paris', limit: 5 })
    expect(res.json).toHaveBeenCalledWith(mockCities)
  })

  it('utilise limit=10 par défaut', async () => {
    cityService.searchByName.mockResolvedValue([])
    const req = { query: { name: 'Lyon' } }
    const res = mockRes()

    await cityController.search(req, res)

    expect(cityService.searchByName).toHaveBeenCalledWith({ name: 'Lyon', limit: 10 })
  })

  it('retourne 500 en cas d\'erreur du service', async () => {
    cityService.searchByName.mockRejectedValue(new Error('DB error'))
    const req = { query: { name: 'Paris' } }
    const res = mockRes()

    await cityController.search(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur base de données' })
  })
})

describe('CityController.getNearby', () => {
  it('retourne 400 si lat est manquant', async () => {
    const req = { query: { lng: '2.35', distance: '50' } }
    const res = mockRes()

    await cityController.getNearby(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Paramètres lat, lng, distance requis' })
  })

  it('retourne 400 si lng est manquant', async () => {
    const req = { query: { lat: '48.85', distance: '50' } }
    const res = mockRes()

    await cityController.getNearby(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('retourne 400 si distance est manquant', async () => {
    const req = { query: { lat: '48.85', lng: '2.35' } }
    const res = mockRes()

    await cityController.getNearby(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('retourne les villes proches pour des paramètres valides', async () => {
    const mockCities = [{ id: 3, name: 'Versailles', distance_km: 20.0 }]
    cityService.findNearby.mockResolvedValue(mockCities)
    const req = {
      query: { lat: '48.85', lng: '2.35', distance: '50', limit: '5', minPopulation: '1000', region: 'Île-de-France' },
    }
    const res = mockRes()

    await cityController.getNearby(req, res)

    expect(cityService.findNearby).toHaveBeenCalledWith({
      lat: 48.85, lng: 2.35, distanceM: 50000, limit: 5, minPopulation: 1000, region: 'Île-de-France',
    })
    expect(res.json).toHaveBeenCalledWith(mockCities)
  })

  it('utilise limit=10 et minPopulation=0 par défaut', async () => {
    cityService.findNearby.mockResolvedValue([])
    const req = { query: { lat: '48.85', lng: '2.35', distance: '50' } }
    const res = mockRes()

    await cityController.getNearby(req, res)

    expect(cityService.findNearby).toHaveBeenCalledWith({
      lat: 48.85, lng: 2.35, distanceM: 50000, limit: 10, minPopulation: 0, region: undefined,
    })
  })

  it('retourne 500 en cas d\'erreur du service', async () => {
    cityService.findNearby.mockRejectedValue(new Error('DB error'))
    const req = { query: { lat: '48.85', lng: '2.35', distance: '50' } }
    const res = mockRes()

    await cityController.getNearby(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur base de données' })
  })
})
