<script setup>
// Delivery location pin - Leaflet + OpenStreetMap tiles (no API key needed).
// Emits { lat, lng, address } so the checkout order snapshot always carries
// the exact pin the customer dropped, independent of whatever they typed in
// the street address field. `address` is reverse-geocoded via Nominatim and
// is a display convenience only — checkout submission uses lat/lng.

import { ref, nextTick, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import BaseModal from '@/components/ui/BaseModal.vue';

// Vite doesn't resolve Leaflet's default marker image paths, so the pin
// renders broken unless we point it at the bundled asset URLs ourselves.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const props = defineProps({
  modelValue: { type: Object, default: null }, // { lat, lng } | null
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const DEFAULT_CENTER = [24.8607, 67.0011]; // Karachi fallback

const open = ref(false);
const locating = ref(false);
const locateError = ref('');
const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);
const resolvingAddress = ref(false);
const pending = ref(null); // { lat, lng, address } picked inside the modal, confirmed on save
let map = null;
let marker = null;
let searchTimer = null;
let geocodeToken = 0;

async function reverseGeocode(lat, lng) {
  const token = ++geocodeToken;
  resolvingAddress.value = true;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    if (token !== geocodeToken) return; // a newer pin was placed while this was in flight
    const address = data.display_name || '';
    if (pending.value) pending.value.address = address;
    searchQuery.value = address;
  } catch {
    // network hiccup — the picker still works off raw coordinates
  } finally {
    if (token === geocodeToken) resolvingAddress.value = false;
  }
}

function placeMarker(lat, lng, address = null) {
  pending.value = { lat, lng, address };
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      placeMarker(pos.lat, pos.lng);
    });
  }
  if (address === null) reverseGeocode(lat, lng);
}

function onSearchInput() {
  clearTimeout(searchTimer);
  const q = searchQuery.value.trim();
  if (q.length < 3) {
    searchResults.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    searching.value = true;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`);
      searchResults.value = await res.json();
    } catch {
      searchResults.value = [];
    } finally {
      searching.value = false;
    }
  }, 400);
}

function pickSearchResult(result) {
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  map.setView([lat, lng], 16);
  placeMarker(lat, lng, result.display_name);
  searchQuery.value = result.display_name;
  searchResults.value = [];
}

async function openPicker() {
  open.value = true;
  locateError.value = '';
  await nextTick();

  if (!map) {
    const start = props.modelValue ? [props.modelValue.lat, props.modelValue.lng] : DEFAULT_CENTER;
    map = L.map('deliveryLocationMap').setView(start, props.modelValue ? 16 : 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    map.on('click', (e) => placeMarker(e.latlng.lat, e.latlng.lng));
    if (props.modelValue) placeMarker(props.modelValue.lat, props.modelValue.lng, props.modelValue.address || null);
    if (props.modelValue?.address) searchQuery.value = props.modelValue.address;
  } else {
    setTimeout(() => map.invalidateSize(), 300);
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    locateError.value = 'Your browser does not support location detection.';
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false;
      map.setView([pos.coords.latitude, pos.coords.longitude], 16);
      placeMarker(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      locating.value = false;
      locateError.value = 'Location permission denied. Please pick the point on the map instead.';
    },
  );
}

function confirm() {
  if (!pending.value) return;
  emit('update:modelValue', { ...pending.value });
  open.value = false;
}

function close() {
  open.value = false;
}

onBeforeUnmount(() => {
  clearTimeout(searchTimer);
  if (map) map.remove();
});
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label>Delivery Location <span class="text-muted">(pin on map)</span></label>
    <div class="location-picker-row">
      <span class="location-picker-value">
        <i class="fa-solid fa-location-dot"></i>
        {{ modelValue ? (modelValue.address || `${modelValue.lat.toFixed(5)}, ${modelValue.lng.toFixed(5)}`) : 'Not set' }}
      </span>
      <button type="button" class="btn btn-outline" @click="openPicker">
        {{ modelValue ? 'Change Location' : 'Pick on Map' }}
      </button>
    </div>
    <span class="error-msg">{{ errorMessage }}</span>

    <BaseModal :open="open" box-class="location-picker-modal" @close="close">
      <h3 class="location-picker-modal__title"><i class="fa-solid fa-map-location-dot"></i> Pick Delivery Location</h3>

      <div class="location-picker-search">
        <div class="location-picker-search__box">
          <div class="location-picker-search__input">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search for an address or area…"
              @input="onSearchInput"
            />
            <i v-if="searching" class="fa-solid fa-spinner spin"></i>
          </div>
          <ul v-if="searchResults.length" class="location-picker-search__results">
            <li v-for="r in searchResults" :key="r.place_id" @click="pickSearchResult(r)">
              <i class="fa-solid fa-location-dot"></i> <span>{{ r.display_name }}</span>
            </li>
          </ul>
        </div>
        <button type="button" class="btn btn-outline-secondary location-picker-search__gps" :disabled="locating" @click="useMyLocation">
          <i class="fa-solid" :class="locating ? 'fa-spinner spin' : 'fa-location-arrow'"></i>
          {{ locating ? 'Locating…' : 'Use My Current Location' }}
        </button>
      </div>

      <p v-if="locateError" class="location-picker-error">{{ locateError }}</p>
      <div id="deliveryLocationMap" class="location-picker-map"></div>
      <p class="location-picker-selected">
        <i class="fa-solid fa-location-dot"></i>
        <span v-if="resolvingAddress">Finding address…</span>
        <span v-else-if="pending">{{ pending.address || `${pending.lat.toFixed(5)}, ${pending.lng.toFixed(5)}` }}</span>
        <span v-else class="text-muted">Click on the map, drag the pin, or search above to mark exactly where the order should be delivered.</span>
      </p>
      <div class="location-picker-actions">
        <button type="button" class="btn btn-outline" @click="close">Cancel</button>
        <button type="button" class="btn btn-primary" :disabled="!pending" @click="confirm">Confirm Location</button>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.location-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.8rem 1rem;
}
.location-picker-value {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}
.location-picker-map {
  height: min(360px, 48vh);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.location-picker-selected {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--color-text);
  font-size: var(--fs-sm);
  margin-top: var(--sp-2);
}
.location-picker-selected i {
  color: var(--color-primary);
  margin-top: 3px;
}
.location-picker-error {
  color: var(--color-danger);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-2);
}
.location-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
}
.location-picker-search {
  margin-bottom: var(--sp-3);
}
.location-picker-search__box {
  position: relative;
  margin-bottom: var(--sp-2);
}
.location-picker-search__input {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 1rem;
}
.location-picker-search__input input {
  border: none;
  outline: none;
  flex: 1;
  min-width: 0;
  font-size: var(--fs-sm);
  background: transparent;
}
.location-picker-search__results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  max-height: 220px;
  overflow-y: auto;
}
.location-picker-search__results li {
  padding: 0.6rem 1rem;
  font-size: var(--fs-sm);
  line-height: 1.4;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.location-picker-search__results li span {
  overflow-wrap: anywhere;
}
.location-picker-search__results li:hover {
  background: var(--color-bg-alt);
}
.location-picker-search__gps {
  width: 100%;
}

:deep(.location-picker-modal) {
  max-width: 640px;
  width: 100%;
  padding: var(--sp-6);
}
:deep(.location-picker-modal .location-picker-modal__title) {
  margin-bottom: var(--sp-3);
}
</style>
