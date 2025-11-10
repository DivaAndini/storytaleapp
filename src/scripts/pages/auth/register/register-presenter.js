export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getRegister({ name, email, password }) {
    this.#view.showSubmitLoadingButton();

    try {
      const response = await this.#model.getRegister({ name, email, password });

      if (!response.ok) {
        this.#view.registeredFailed(response.message);
        return;
      }

      this.#view.registeredSuccessfully(response.message);
    } catch (error) {
      this.#view.registeredFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
