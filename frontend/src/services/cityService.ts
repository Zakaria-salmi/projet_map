import type { City } from '../types/City'

const BASE_URL = 'http://localhost:3000/api'

export async function fetchNearby(params: {
  lat: number
  lng: number
  distance: number
  limit: number
  minPopulation: number
  region: string
}): Promise<City[]> {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    distance: String(params.distance),
    limit: String(params.limit),
    minPopulation: String(params.minPopulation),
    region: params.region,
  })
  const res = await fetch(`${BASE_URL}/cities/nearby?${query}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchByName(params: {
  name: string
  limit: number
}): Promise<City[]> {
  const query = new URLSearchParams({
    name: params.name,
    limit: String(params.limit),
  })
  const res = await fetch(`${BASE_URL}/cities/search?${query}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
