import StoryDetailPresenter from './story-detail-presenter';
import * as StoryAPI from '../../data/api';
import { checkAuthenticatedRoute } from '../../utils/auth.js';
import { showFormattedDate } from '../../utils/index.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Database from '../../data/database.js';

export default class StoryDetailPage {
  #presenter = null;
  #map = null;
  #marker = null;

  async render() {
    return checkAuthenticatedRoute(`
      <section class="story-detail-container">
        <div class="story-detail__header">
          <h1 class="story-detail__title">Detail Cerita</h1>
        </div>
        <article id="story-detail-content" class="story-detail__content">
          <p class="loading-text">Memuat detail cerita...</p>
        </article>
        
        <div class="button-container">
          <button id="back-button" class="back-button">Kembali</button>
          <button id="save-button" class="save-button">
            <i class="fas fa-bookmark"></i>
            Simpan Cerita
          </button>
        </div>
      </section>

      <section class="story-detail-map-container">
        <h2 class="story-detail-map__title">Lihat Lokasi Disini!</h2>
        <div id="story-map" class="story-map"></div>
      </section>
    `);
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter({
      view: this,
      model: StoryAPI,
      dbModel: Database,
    });
    const storyId = window.location.hash.slice(9);
    const storyData = await this.#presenter.loadStoryDetail(storyId);

    this.storyData = storyData;
    await this.#presenter.showSaveButton(storyId);
  }

  displayStoryDetail(story) {
    const storyDetailContent = document.getElementById('story-detail-content');
    const formattedDate = showFormattedDate(story.createdAt, 'id-ID');

    const buttonBack = document.getElementById('back-button');
    buttonBack.addEventListener('click', () => {
      window.history.back();
    });

    storyDetailContent.innerHTML = `
      <img src="${story.photoUrl}" alt="${story.name}" class="story-detail__image" />
      <h2 class="story-item__name">${story.name}</h2>
      <p class="story-item__date">${formattedDate}</p>
      <p class="story-detail__description">${story.description}</p>
    `;

    if (story.lat && story.lon) {
      this.#renderMap(story);
    } else {
      document.getElementById('story-map').innerHTML =
        '<p class="no-location-text">Tidak ada data lokasi.</p>';
    }
  }

  #renderMap(story) {
    const mapContainer = document.getElementById('story-map');
    mapContainer.style.height = '400px';
    mapContainer.style.marginTop = '1rem';
    mapContainer.style.borderRadius = '8px';

    this.#map = L.map('story-map').setView([story.lat, story.lon], 13);

    const baseLayers = {
      OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      'Esri World Imagery': L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ),
    };
    baseLayers['OpenStreetMap'].addTo(this.#map);
    L.control.layers(baseLayers).addTo(this.#map);

    const highlightIcon = L.divIcon({
      className: 'highlight-marker',
      html: '<div class="highlight-marker-icon"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    this.#marker = L.marker([story.lat, story.lon], { icon: highlightIcon }).addTo(this.#map);
    this.#marker
      .bindPopup(
        `
      <b>${story.name}</b><br>
      ${story.description.slice(0, 80)}...
      `
      )
      .openPopup();
  }

  displayError(message) {
    const storyDetailContent = document.getElementById('story-detail-content');
    storyDetailContent.innerHTML = `<p class="error-text">${message}</p>`;
  }

  renderSaveButton() {
    const container = document.querySelector('.button-container');
    container.innerHTML = `
      <button id="back-button" class="back-button">Kembali</button>
      <button id="save-button" class="save-button">
        <i class="fas fa-bookmark"></i> Simpan Cerita
      </button>
    `;

    document.getElementById('back-button').addEventListener('click', () => {
      window.history.back();
    });

    document.getElementById('save-button').addEventListener('click', async () => {
      await this.#presenter.saveStory(this.storyData);
    });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton(){
    const container = document.querySelector('.button-container');
    container.innerHTML = `
      <button id="back-button" class="back-button">Kembali</button>
      <button id="remove-button" class="remove-button">
        <i class="fas fa-bookmark"></i> Hapus dari Bookmark
      </button>
    `;

    document.getElementById('back-button').addEventListener('click', () => {
      window.history.back();
    });

    document.getElementById('remove-button').addEventListener('click', async () => {
      await this.#presenter.removeStory(this.storyData);
    });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }

  removeFromBookmarkFailed(message) {
    alert(message);
  }
}
