import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { City } from '../types/City'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const franceBounds = L.latLngBounds(
  L.latLng(41.3, -5.2),
  L.latLng(51.1, 9.6)
)

export function useMap(onMapClick: (latlng: L.LatLng) => void) {
  const clickedLatLng = ref<L.LatLng | undefined>()
  let map: L.Map | undefined
  let marker: L.Marker | undefined
  let circle: L.Circle | undefined
  let cityMarkers: Map<number, L.Marker> = new Map()

  onMounted(() => {
    map = L.map('map', {
      maxBounds: franceBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 5,
    }).setView([46.5, 2.5], 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    map.on('click', (e) => {
      clickedLatLng.value = e.latlng
      onMapClick(e.latlng)
    })
  })

  function updateMarkerAndCircle(latlng: L.LatLng, distance: number) {
    if (!map) return
    marker?.remove()
    circle?.remove()

    circle = L.circle(latlng, {
      radius: distance * 1000,
      color: '#6366f1',
      weight: 2,
      fillColor: '#6366f1',
      fillOpacity: 0.08,
    }).addTo(map)

    marker = L.marker(latlng, {
      icon: L.divIcon({
        className: '',
        html: `<div class="click-marker"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    }).addTo(map)
  }

  function updateCircleRadius(distance: number) {
    circle?.setRadius(distance * 1000)
  }

  function updateCityMarkers(data: City[]) {
    cityMarkers.forEach(m => m.remove())
    cityMarkers = new Map()
    if (!map) return

    for (const city of data) {
      const tooltipContent = city.distance_km != null
        ? `<strong>${city.name}</strong><br>${city.population.toLocaleString('fr-FR')} hab.<br>${city.distance_km} km`
        : `<strong>${city.name}</strong><br>${city.population.toLocaleString('fr-FR')} hab.`

      const m = L.marker([city.lat, city.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="city-marker"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        }),
      })
        .bindTooltip(tooltipContent, { direction: 'top', offset: [0, -6] })
        .addTo(map)

      cityMarkers.set(city.id, m)
    }
  }

  function focusCity(city: City) {
    if (!map) return
    map.flyTo([city.lat, city.lng], 13, { duration: 0.8 })
    cityMarkers.get(city.id)?.openTooltip()
  }

  return { clickedLatLng, updateMarkerAndCircle, updateCircleRadius, updateCityMarkers, focusCity }
}
