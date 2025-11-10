export default class StoryDetailPresenter {
  #view;
  #model;
  #dbModel

  constructor({ view, model, dbModel }) {
    this.#view = view;
    this.#model = model;
    this.#dbModel = dbModel;
  }

  async loadStoryDetail(storyId) {
    try {
      const response = await this.#model.getStoryDetail(storyId);
      if (response.ok) {
        this.#view.displayStoryDetail(response.story);
        return response.story;
      } else {
        this.#view.displayError(response.message || 'Gagal memuat detail cerita.');
      }
    } catch (error) {
      this.#view.displayError(error.message);
    }
  }

  async saveStory(story) {
    try {
      await this.#dbModel.putStory(story);
      this.#view.saveToBookmarkSuccessfully('Cerita berhasil disimpan!');
      await this.showSaveButton(story.id);
    } catch (error) {
      console.error('saveStory:', error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory(story) {
    try {
      await this.#dbModel.removeStory(story.id);
      this.#view.removeFromBookmarkSuccessfully('Cerita dihapus dari bookmark');
      await this.showSaveButton(story.id);
    } catch (error) {
      console.error('removeStory:', error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton(storyId) {
    if (await this.#isStorySaved(storyId)) {
      this.#view.renderRemoveButton(storyId);
      return;
    }
    this.#view.renderSaveButton(storyId);
  }

  async #isStorySaved(storyId) {
    return !!(await this.#dbModel.getStoryById(storyId));
  }
}
