export default class BookmarkPresenter {
  #view;
  #dbModel
  #stories = [];

  constructor({ view, dbModel }) {
    this.#view = view;
    this.#dbModel = dbModel;
  }

  async loadBookmarkedStories() {
    try {
      const stories = await this.#dbModel.getAllStories();
      this.#stories = stories;

      if (stories.length === 0) {
        this.#view.displayEmptyMessage('Belum ada cerita yang disimpan.');
      } else {
        this.#view.displayBookmarkedStories(stories);
      }
    } catch (error) {
      console.error('loadBookmarkedStories:', error);
      this.#view.displayError('Gagal memuat cerita yang disimpan.');
    }
  }

  handleSearch(keyword) {
    const filtered = this.#stories.filter((story) =>
      story.name.toLowerCase().includes(keyword.toLowerCase()) ||
      story.description.toLowerCase().includes(keyword.toLowerCase())
    );
    this.#view.displayBookmarkedStories(filtered);
  }

  handleSort(type) {
    let sorted = [...this.#stories];

    switch (type) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'az':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    this.#view.displayBookmarkedStories(sorted);
  }
}