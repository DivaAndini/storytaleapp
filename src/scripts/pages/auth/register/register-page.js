import RegisterPresenter from './register-presenter';
import * as StoryAPI from '../../../data/api';
import Swal from 'sweetalert2';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-container">
        <article class="register-form-container">
          <h1 class="register__title">Daftar Akun</h1>

          <form id="register-form" class="register-form">
            <div class="form-control">
              <label for="name-input">Nama Lengkap</label>
              <input id="name-input" type="text" name="name" placeholder="Masukkan nama lengkap" required>
            </div>

            <div class="form-control">
              <label for="email-input">Email</label>
              <input id="email-input" type="email" name="email" placeholder="contoh@email.com" required>
            </div>

            <div class="form-control">
              <label for="password-input">Password</label>
              <input id="password-input" type="password" name="password" placeholder="Masukkan password baru" required>
            </div>

            <div id="submit-button-container">
              <button class="btn" type="submit">Daftar Akun</button>
            </div>

            <p class="form__footer">
              Sudah punya akun? <a href="#/login">Masuk</a>
            </p>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    document.getElementById('register-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name-input').value;
      const email = document.getElementById('email-input').value;
      const password = document.getElementById('password-input').value;

      await this.#presenter.getRegister({ name, email, password });
    });
  }

  registeredSuccessfully() {
    setTimeout(() => {
      location.hash = '/';
    }, 700);
  }

  registeredFailed(message) {
    Swal.fire({
      icon: 'error',
      title: 'Registrasi Gagal',
      text: message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.',
      confirmButtonText: 'OK',
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
