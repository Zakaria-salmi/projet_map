const cityService = require('../services/cityService')

class CityController {
  async search(req, res) {
    const { name, limit } = req.query

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Paramètre name requis' })
    }

    try {
      const cities = await cityService.searchByName({
        name: name.trim(),
        limit: parseInt(limit) || 10,
      })
      res.json(cities)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Erreur base de données' })
    }
  }

  async getNearby(req, res) {
    const { lat, lng, distance, limit, minPopulation, region } = req.query

    const latF = parseFloat(lat)
    const lngF = parseFloat(lng)
    const distanceM = parseFloat(distance) * 1000

    if (isNaN(latF) || isNaN(lngF) || isNaN(distanceM)) {
      return res.status(400).json({ error: 'Paramètres lat, lng, distance requis' })
    }

    try {
      const cities = await cityService.findNearby({
        lat: latF,
        lng: lngF,
        distanceM,
        limit: parseInt(limit) || 10,
        minPopulation: parseInt(minPopulation) || 0,
        region,
      })
      res.json(cities)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Erreur base de données' })
    }
  }
}

module.exports = new CityController()
