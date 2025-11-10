export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();

    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok || response.error) {
        this.#view.loginFailed(response.message || 'Terjadi kesalahan saat login');
        return;
      }

      const token = response?.loginResult?.token;
      if (!token) {
        this.#view.loginFailed('Token tidak ditemukan. Gagal login.');
        return;
      }

      this.#authModel.putAccessToken(token);
      this.#view.loginSuccessfully(response.message || 'Login berhasil!');
    } catch (error) {
      this.#view.loginFailed(error.message || 'Gagal menghubungkan ke server');
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
