<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMap } from './composables/useMap'
import { fetchNearby, fetchByName } from './services/cityService'
import type { City } from './types/City'
import { Region } from './types/Region'

const maxCities = ref(10)
const maxDistance = ref(100)
const minPopulation = ref(0)
const selectedRegion = ref<Region>(Region.Toutes)
const searchQuery = ref('')

const cities = ref<City[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const regions = Object.values(Region)

let debounceTimer: ReturnType<typeof setTimeout> | undefined

const { clickedLatLng, updateMarkerAndCircle, updateCircleRadius, updateCityMarkers, focusCity } = useMap((latlng) => {
  searchQuery.value = ''
  updateMarkerAndCircle(latlng, maxDistance.value)
  loadNearby()
})

watch([maxDistance, maxCities, minPopulation, selectedRegion], () => {
  if (!clickedLatLng.value) return
  updateCircleRadius(maxDistance.value)
  scheduleSearch(loadNearby)
})

watch(searchQuery, (val) => {
  if (val.trim() === '') return
  scheduleSearch(loadByName)
})

function scheduleSearch(fn: () => void) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fn, 400)
}

async function loadNearby() {
  if (!clickedLatLng.value) return
  loading.value = true
  error.value = null
  try {
    const data = await fetchNearby({
      lat: clickedLatLng.value.lat,
      lng: clickedLatLng.value.lng,
      distance: maxDistance.value,
      limit: maxCities.value,
      minPopulation: minPopulation.value,
      region: selectedRegion.value,
    })
    cities.value = data
    updateCityMarkers(data)
  } catch {
    error.value = 'Impossible de contacter le serveur.'
    cities.value = []
    updateCityMarkers([])
  } finally {
    loading.value = false
  }
}

async function loadByName() {
  const name = searchQuery.value.trim()
  if (!name) return
  loading.value = true
  error.value = null
  try {
    const data = await fetchByName({ name, limit: maxCities.value })
    cities.value = data
    updateCityMarkers(data)
  } catch {
    error.value = 'Impossible de contacter le serveur.'
    cities.value = []
    updateCityMarkers([])
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">🗺</div>
        <div>
          <h1 class="title">Villes de France</h1>
          <p class="subtitle">Explorez les villes à proximité</p>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <p class="section-label">Recherche par nom</p>
        <div class="search-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
          />
          <span class="search-icon">⌕</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <p class="section-label">Paramètres de recherche</p>

        <div class="field">
          <div class="field-header">
            <span class="field-label">Distance maximale</span>
            <span class="field-value">{{ maxDistance }} km</span>
          </div>
          <input type="range" v-model.number="maxDistance" min="10" max="600" step="10" />
        </div>

        <div class="field">
          <div class="field-header">
            <span class="field-label">Nombre de villes</span>
            <span class="field-value">{{ maxCities }}</span>
          </div>
          <input type="range" v-model.number="maxCities" min="1" max="1000" step="1" />
        </div>

        <div class="field">
          <span class="field-label">Population minimale</span>
          <div class="number-input-wrapper">
            <input type="number" v-model.number="minPopulation" min="0" step="10000" placeholder="0" />
            <span class="input-unit">hab.</span>
          </div>
        </div>

        <div class="field">
          <span class="field-label">Région</span>
          <div class="select-wrapper">
            <select v-model="selectedRegion">
              <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
            </select>
            <span class="select-arrow">▾</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section results-section">
        <p class="section-label">
          Résultats
          <span v-if="!loading && cities.length > 0" class="result-count">{{ cities.length }} ville{{ cities.length !== 1 ? 's' : '' }}</span>
        </p>

        <div v-if="!clickedLatLng && !searchQuery" class="hint">
          Cliquez sur la carte ou recherchez une ville.
        </div>

        <div v-else-if="loading" class="loading">
          <div class="spinner"></div>
          Recherche en cours…
        </div>

        <div v-else-if="error" class="error-msg">{{ error }}</div>

        <div v-else-if="cities.length === 0" class="hint">
          Aucune ville trouvée.
        </div>

        <ul v-else class="city-list">
          <li
            v-for="city in cities"
            :key="city.id"
            class="city-item"
            @click="focusCity(city)"
          >
            <div class="city-name">{{ city.name }}</div>
            <div class="city-meta">
              <span class="city-pop">{{ city.population.toLocaleString('fr-FR') }} hab.</span>
              <span v-if="city.distance_km != null" class="city-dist">{{ city.distance_km }} km</span>
            </div>
            <div class="city-region">{{ city.region }}</div>
          </li>
        </ul>
      </div>
    </aside>

    <div id="map"></div>
  </div>
</template>

<style>

* {
  box-sizing: border-box;
  margin: 0; padding: 0;
}

body, html, #app {
  height: 100%;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f8f9fb;
}

.layout { display: flex; height: 100vh; }

.sidebar {
  width: 320px;
  min-width: 320px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
  gap: 24px;
  overflow-y: auto;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  font-size: 2rem;
  line-height: 1;
}

.title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 2px;
}

.divider {
  height: 1px;
  background: #f1f3f5;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-count {
  background: #eef2ff;
  color: #6366f1;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 9px 36px 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #111827;
  background: #fafafa;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #6366f1;
  background: #fff;
}

.search-icon {
  position: absolute;
  right: 10px;
  font-size: 1.1rem;
  color: #9ca3af;
  pointer-events: none;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.field-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 20px;
}

input[type="range"] {
  width: 100%;
  height: 4px;
  appearance: none;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 0 3px #eef2ff;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 5px #e0e7ff;
}

.number-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.number-input-wrapper input[type="number"] {
  width: 100%;
  padding: 9px 48px 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #111827;
  background: #fafafa;
  outline: none;
  transition: border-color 0.2s;
}

.number-input-wrapper input[type="number"]:focus {
  border-color: #6366f1;
  background: #fff;
}

.input-unit {
  position: absolute;
  right: 12px;
  font-size: 0.8rem;
  color: #9ca3af;
  pointer-events: none;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  padding: 9px 36px 9px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #111827;
  background: #fafafa;
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-wrapper select:focus {
  border-color: #6366f1;
  background: #fff;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  font-size: 0.85rem;
}

#map {
  flex: 1;
}

.click-marker {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 0 2px #6366f1, 0 2px 6px rgba(99, 102, 241, 0.4);
}

.city-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.results-section {
  flex: 1;
  min-height: 0;
}

.city-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 360px;
  padding-right: 2px;
}

.city-item {
  padding: 10px 12px;
  border: 1.5px solid #f1f3f5;
  border-radius: 10px;
  background: #fafafa;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.city-item:hover {
  border-color: #c7d2fe;
  background: #f5f3ff;
}

.city-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.city-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
}

.city-pop {
  font-size: 0.78rem;
  color: #6b7280;
}

.city-dist {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6366f1;
}

.city-region {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 2px;
}

.hint {
  font-size: 0.82rem;
  color: #9ca3af;
  text-align: center;
  padding: 16px 0;
}

.error-msg {
  font-size: 0.82rem;
  color: #ef4444;
  text-align: center;
  padding: 12px 0;
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #9ca3af;
  padding: 12px 0;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
