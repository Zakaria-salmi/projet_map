jest.mock('../config/database', () => ({ query: jest.fn() }))

const pool = require('../config/database')
const cityService = require('../services/cityService')

afterEach(() => jest.clearAllMocks())

describe('CityService.searchByName', () => {
  it('retourne les villes correspondant au nom', async () => {
    const mockRows = [
      { id: 1, name: 'Paris', population: 2000000, region: 'Île-de-France', lng: 2.35, lat: 48.85 },
    ]
    pool.query.mockResolvedValue({ rows: mockRows })

    const result = await cityService.searchByName({ name: 'Paris', limit: 10 })

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('ILIKE'),
      ['%Paris%', 10]
    )
    expect(result).toEqual(mockRows)
  })

  it('retourne un tableau vide si aucune ville trouvée', async () => {
    pool.query.mockResolvedValue({ rows: [] })

    const result = await cityService.searchByName({ name: 'xyz', limit: 10 })

    expect(result).toEqual([])
  })

  it('propage les erreurs de la base de données', async () => {
    pool.query.mockRejectedValue(new Error('DB error'))

    await expect(cityService.searchByName({ name: 'Paris', limit: 10 })).rejects.toThrow('DB error')
  })
})

describe('CityService.findNearby', () => {
  it('retourne les villes proches sans filtre de région', async () => {
    const mockRows = [
      { id: 2, name: 'Lyon', population: 500000, region: 'Auvergne-Rhône-Alpes', lng: 4.83, lat: 45.75, distance_km: 10.5 },
    ]
    pool.query.mockResolvedValue({ rows: mockRows })

    const result = await cityService.findNearby({
      lat: 45.75, lng: 4.83, distanceM: 50000, limit: 10, minPopulation: 0,
    })

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain('ST_DWithin')
    expect(params).toEqual([45.75, 4.83, 50000, 0, 10])
    expect(result).toEqual(mockRows)
  })

  it('ajoute un filtre de région quand elle est renseignée', async () => {
    pool.query.mockResolvedValue({ rows: [] })

    await cityService.findNearby({
      lat: 48.1, lng: -1.68, distanceM: 30000, limit: 5, minPopulation: 1000, region: 'Bretagne',
    })

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain('region')
    expect(params).toContain('Bretagne')
  })

  it('ignore le filtre région pour "Toutes les régions"', async () => {
    pool.query.mockResolvedValue({ rows: [] })

    await cityService.findNearby({
      lat: 48.85, lng: 2.35, distanceM: 50000, limit: 10, minPopulation: 0, region: 'Toutes les régions',
    })

    const [, params] = pool.query.mock.calls[0]
    expect(params).not.toContain('Toutes les régions')
  })

  it('propage les erreurs de la base de données', async () => {
    pool.query.mockRejectedValue(new Error('DB error'))

    await expect(
      cityService.findNearby({ lat: 45.75, lng: 4.83, distanceM: 50000, limit: 10, minPopulation: 0 })
    ).rejects.toThrow('DB error')
  })
})
