import LoginPresenter from './login-presenter';
import * as StoryAPI from '../../../data/api';
import * as AuthModel from '../../../utils/auth';
import Swal from 'sweetalert2';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="login-container">
        <article class="login-form-container">
          <h1 class="login__title">Masuk Akun</h1>

          <form id="login-form" class="login-form">
            <div class="form-control">
              <label for="email-input">Email</label>
              <input id="email-input" type="email" name="email" placeholder="contoh@email.com" required>
            </div>

            <div class="form-control">
              <label for="password-input">Password</label>
              <input id="password-input" type="password" name="password" placeholder="Masukkan password" required>
            </div>

            <div id="submit-button-container">
              <button class="btn" type="submit">Masuk</button>
            </div>

            <p id="login-message" class="login-message"></p>

            <p class="form__footer">
              Belum punya akun? <a href="#/register">Daftar</a>
            </p>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document.getElementById('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email-input').value;
      const password = document.getElementById('password-input').value;

      await this.#presenter.getLogin({ email, password });
    });
  }

  loginSuccessfully() {
    Swal.fire({
      title: 'Login Berhasil!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    setTimeout(() => {
      location.hash = '/';
    }, 700);
  }

  loginFailed(message) {
    this.showSubmitLoadingButton;
    Swal.fire({
      icon: 'error',
      title: 'Login Gagal',
      text: message || 'Email atau password yang kamu masukkan salah. Silakan coba lagi.',
      confirmButtonText: 'Coba Lagi',
      confirmButtonColor: '#7b1a21ff',
    });
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <span class="spinner"></span> Masuk
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Masuk</button>
    `;
  }
}
