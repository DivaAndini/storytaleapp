import * as StoryAPI from '../../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { checkAuthenticatedRoute } from '../../utils/auth.js';

export default class MapPage {
  #map = null;
  #markers = new Map();
  #zoomLevel = 5;

  async render() {
    return `
      <section class="map-container">
        <h1 class="map-title">Peta Cerita Pengguna</h1>
        <div id="map" class="map-view"></div>
      </section>
    `;
  }

  async afterRender() {
    await checkAuthenticatedRoute();

    this.#map = L.map('map').setView([-2.5489, 118.0149], 5);

    const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });

    const baseLayers = {
      OpenStreetMap: defaultLayer,
      'Esri World Imagery': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ),
    };

    defaultLayer.addTo(this.#map);
    L.control.layers(baseLayers).addTo(this.#map);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    try {
      const response = await StoryAPI.getAllStories();
      const stories = response.listStory || [];

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon], { icon: defaultIcon }).addTo(this.#map);
          marker.bindPopup(`
            <b>${story.name}</b><br>
            ${story.description.slice(0, 100)}...<br>
            <a href="#/detail/${story.id}">Baca selengkapnya</a>
          `);
          this.#markers.set(story.id, marker);
        }
      });
    } catch (error) {
      console.error('Gagal memuat cerita untuk peta:', error);
    }
  }

  highlightStoryMarker(storyId) {
    this.#markers.forEach((marker) => {
      marker.setIcon(
        L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })
      );
    });

    const targetMarker = this.#markers.get(storyId);
    if (targetMarker) {
      targetMarker.setIcon(
        L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })
      );

      this.#map.setView(targetMarker.getLatLng(), 10, { animate: true });
      targetMarker.openPopup();
    }
  }
}
