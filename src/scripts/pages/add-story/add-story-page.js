import AddStoryPresenter from './add-story-presenter';
import * as StoryAPI from '../../data/api';
import { checkAuthenticatedRoute } from '../../utils/auth.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Camera from '../../utils/camera.js';
import Swal from 'sweetalert2';

export default class AddStoryPage {
  #presenter = null;
  #map = null;
  #selectedLat = null;
  #selectedLon = null;
  #camera = null;
  #marker;

  async render() {
    return checkAuthenticatedRoute(`
      <section class="add-story-container">
        <div class="add-story__header">
          <h1 class="add-story__title">Tambah Cerita Baru</h1>
          <p class="add-story__subtitle">Bagikan ceritamu dengan StoryTale.</p>
        </div>

        <form id="add-story-form" class="add-story__form">
          <div class="form-group">
            <label for="story-description">Tulis Ceritamu</label>
            <textarea id="story-description" name="description" placeholder="Tulis ceritamu di sini..." rows="5" required></textarea>
          </div>

          <div class="form-group-camera">
            <label for="story-photo">Foto Cerita</label>
            <input type="file" id="story-photo" name="photo" accept="image/*" required>
            <button type="button" id="open-camera" class="btn btn-secondary">Gunakan Kamera</button>
            <video id="camera-preview" autoplay playsinline style="display:none; width:100%; border-radius:10px; margin-top:10px;"></video>
            <button type="button" id="capture-photo" class="btn btn-secondary" style="display:none;">Ambil Foto</button>

            <button type="button" id="cancel-camera" class="btn btn-danger" style="display:none;">Batalkan Kamera</button>
          </div>

          <div class="form-group-map">
            <label>Pilih Lokasi di Peta</label>
            <div id="map" style="height: 300px; border-radius: 10px; margin-top: 10px;"></div>
            <p class="map-instruction">Klik di peta untuk menentukan lokasi cerita kamu.</p>
            <p id="selected-location" class="location-text">Belum ada lokasi dipilih.</p>
          </div>

          <div id="submit-button-container">
            <button type="submit" class="btn btn-primary">Kirim Cerita</button>
          </div>
          
        </form>

        <div id="add-story-message" class="add-story__message"></div>
      </section>
    `);
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#initializeMap();
    this.#setupForm();
    this.#setupCamera();
  }

  #initializeMap() {
    this.#map = L.map('map').setView([-2.5489, 118.0149], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.#map);

    setTimeout(() => {
      this.#map.invalidateSize();
    }, 100);

    const highlightIcon = L.divIcon({
      className: 'highlight-marker',
      html: '<div class="highlight-marker-icon"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    this.#map.on('click', (event) => {
      this.#selectedLat = event.latlng.lat;
      this.#selectedLon = event.latlng.lng;

      if (this.#marker) {
        this.#map.removeLayer(this.#marker);
      }

      this.#marker = L.marker([this.#selectedLat, this.#selectedLon], {
        icon: highlightIcon,
      }).addTo(this.#map);
      document.getElementById('selected-location').textContent =
        `Lokasi dipilih: (${this.#selectedLat.toFixed(5)}, ${this.#selectedLon.toFixed(5)})`;
    });
  }

  #setupCamera() {
    const cameraPreview = document.getElementById('camera-preview');
    const openCameraButton = document.getElementById('open-camera');
    const capturePhotoButton = document.getElementById('capture-photo');
    const cancelCameraButton = document.getElementById('cancel-camera');
    const photoInput = document.getElementById('story-photo');

    this.#camera = new Camera(cameraPreview);

    openCameraButton.addEventListener('click', async () => {
      try {
        await this.#camera.start();
        cameraPreview.style.display = 'block';
        capturePhotoButton.style.display = 'inline-block';
        cancelCameraButton.style.display = 'inline-block';
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Akses Kamera Ditolak',
          text: 'Kami tidak dapat mengakses kamera kamu. Pastikan izin kamera sudah diberikan.',
        });
      }
    });

    capturePhotoButton.addEventListener('click', () => {
      const photoDataUrl = this.#camera.capture();

      fetch(photoDataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'captured-photo.png', { type: 'image/png' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          photoInput.files = dataTransfer.files;
        });

      this.#camera.stop();
      capturePhotoButton.style.display = 'none';
      capturePhotoButton.style.display = 'none';
      cancelCameraButton.style.display = 'none';
    });

    cancelCameraButton.addEventListener('click', () => {
      this.#camera.stop();
      cameraPreview.style.display = 'none';
      capturePhotoButton.style.display = 'none';
      cancelCameraButton.style.display = 'none';
    });

    window.addEventListener('beforeunload', () => {
      this.#camera.stop();
    });
  }

  #setupForm() {
    const form = document.getElementById('add-story-form');
    const messageContainer = document.getElementById('add-story-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const description = document.getElementById('story-description').value.trim();
      const photoInput = document.getElementById('story-photo').files[0];

      if (!description || !photoInput) {
        messageContainer.innerHTML = `<p class="error-text">Deskripsi dan foto wajib diisi.</p>`;
        return;
      }

      document.getElementById('submit-button-container').innerHTML = `
        <button type="submit" class="btn btn-primary" disabled>
          <i class="spinner"></i> Mengirim...
        </button>
      `;

      await this.#presenter.addNewStory({
        description,
        photo: photoInput,
        lat: this.#selectedLat,
        lon: this.#selectedLon,
      });
    });
  }

  storyAddedSuccessfully() {
    document.getElementById('add-story-form').reset();
    location.hash = '/login';
  }

  displayError(message) {
    const messageContainer = document.getElementById('add-story-message');
    
    messageContainer.innerHTML = '';

    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: message,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#d33',
    });
  }
}
