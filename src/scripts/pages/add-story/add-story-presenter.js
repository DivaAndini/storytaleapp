export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async addNewStory({ description, photo, lat, lon }) {
    try {
      const response = await this.#model.addNewStory({ description, photo, lat, lon });
      if (response.ok) {
        this.#view.storyAddedSuccessfully(response.message || 'Cerita berhasil ditambahkan.');
      } else {
        this.#view.displayError(response.message || 'Gagal menambahkan cerita.');
      }
    } catch (error) {
      this.#view.displayError(error.message);
    }
  }
}
