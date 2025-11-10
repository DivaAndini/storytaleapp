import HomePresenter from './home-presenter.js';
import * as StoryAPI from '../../data/api';
import { checkAuthenticatedRoute, isUserLoggedIn } from '../../utils/auth.js';
import { showFormattedDate } from '../../utils/index.js';

export default class HomePage {
  #presenter = null;

  async render() {
    return checkAuthenticatedRoute(`
      <section class="home-container">
        <div class="home__header">
          <h1 class="home__title">Cerita Hari Ini ✎</h1>
          <p class="home__subtitle">Temukan cerita inspiratif dan menarik dari berbagai pengguna StoryTale.</p>
        </div>

        <div class="story-controls">
          <div class="form-group-story-controls">
            <label for="search-input">Cari Cerita</label>
            <input 
              id="search-input" 
              type="text" 
              placeholder="Cari cerita..." 
              class="search-box" 
              aria-label="Kolom pencarian cerita"
            />
          </div>

          <div class="form-group-story-controls">
            <label for="sort-select">Urutkan Cerita</label>
            <select 
              id="sort-select" 
              class="sort-select" 
              aria-label="Urutkan cerita berdasarkan"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </div>
        </div>

        <div id="story-list" class="story-list">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p class="loading-text">Memuat cerita...</p>
          </div>
        </div>
      </section>
    `);
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.loadStories();

    const subscribeButton = document.getElementById('push-notification-tools');
    if (subscribeButton) {
      if (isUserLoggedIn()) {
        subscribeButton.style.display = 'block';
      } else {
        subscribeButton.style.display = 'none';
      }
    }

    document.getElementById('search-input').addEventListener('input', (e) => {
      this.#presenter.handleSearch(e.target.value);
    });

    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.#presenter.handleSort(e.target.value);
    });
  }

  displayStories(stories) {
    const storyList = document.getElementById('story-list');
    storyList.innerHTML = '';

    if (stories.length === 0) {
      storyList.innerHTML = '<p class="no-stories-text">Belum ada cerita untuk ditampilkan.</p>';
      return;
    }

    stories.forEach((story) => {
      const storyItem = document.createElement('article');
      storyItem.classList.add('story-item');

      const maxDescriptionLength = 100;
      const shortDescription =
        story.description.length > maxDescriptionLength
          ? story.description.slice(0, maxDescriptionLength) + '...'
          : story.description;

      const formattedDate = showFormattedDate(story.createdAt, 'id-ID');

      storyItem.innerHTML = `
        <div class="story-item__content">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-item__image" />
          <h2 class="story-item__name">${story.name}</h2>
          <p class="story-item__date">${formattedDate}</p>
          <p class="story-item__desc">${(story.description || 'Tidak ada konten').slice(0, 100)}...</p>
          <a href="#/detail/${story.id}" class="story-item__link">Baca selengkapnya</a>
        </div>
      `;
      storyList.appendChild(storyItem);
    });
  }

  displayError(message) {
    document.getElementById('story-list').innerHTML = `
      <p class="error-text">Terjadi kesalahan: ${message}</p>
    `;
  }
  
}
