const pool = require('../config/database')

class CityService {
  async searchByName({ name, limit }) {
    const result = await pool.query(
      `SELECT id, name, population, region, ST_X(geom) AS lng, ST_Y(geom) AS lat
       FROM public.cities
       WHERE name ILIKE $1
       ORDER BY population DESC
       LIMIT $2`,
      [`%${name}%`, limit]
    )
    return result.rows
  }

  async findNearby({ lat, lng, distanceM, limit, minPopulation, region }) {
    const point = `ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography`

    let query = `
      SELECT
        id,
        name,
        population,
        region,
        ST_X(geom) AS lng,
        ST_Y(geom) AS lat,
        ROUND((ST_Distance(geom::geography, ${point}) / 1000)::numeric, 1) AS distance_km
      FROM public.cities
      WHERE
        ST_DWithin(geom::geography, ${point}, $3)
        AND population >= $4
    `
    const params = [lat, lng, distanceM, minPopulation]

    if (region && region !== 'Toutes les régions') {
      query += ` AND region = $${params.length + 1}`
      params.push(region)
    }

    query += ` ORDER BY distance_km ASC LIMIT $${params.length + 1}`
    params.push(limit)

    const result = await pool.query(query, params)
    return result.rows
  }
}

module.exports = new CityService()
