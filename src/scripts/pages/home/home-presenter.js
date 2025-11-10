export default class HomePresenter {
  #view;
  #model;
  #stories = [];

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadStories() {
    try {
      const response = await this.#model.getAllStories();
      this.#stories = response.listStory || [];
      if (response.ok) {
        this.#view.displayStories(response.listStory || []);
      } else {
        this.#view.displayError(response.message || 'Gagal memuat cerita.');
      }
    } catch (error) {
      this.#view.displayError(error.message);
    }
  }

  handleSearch(keyword) {
    const filtered = this.#stories.filter((story) =>
      story.name.toLowerCase().includes(keyword.toLowerCase()) ||
      story.description.toLowerCase().includes(keyword.toLowerCase())
    );
    this.#view.displayStories(filtered);
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

    this.#view.displayStories(sorted);
  }
}
