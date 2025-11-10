import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { checkUnauthenticatedRouteOnly, checkAuthenticatedRoute } from '../utils/auth.js';
import { 
  getLogout,
  isUserLoggedIn
} from '../utils/auth.js';
import { isServiceWorkerAvailable } from '../utils/index.js';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe
} from '../utils/notification-helper.js'
import Swal from 'sweetalert2';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupLogoutButton();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupLogoutButton() {
    const container = document.getElementById('logout-button-container');

    container.innerHTML = '';

    const button = document.createElement('button');
    button.id = 'logout-button';
    button.className = 'logout-button';

    if (isUserLoggedIn()) {
      button.textContent = '▶ Logout';
      button.addEventListener('click', async () => {
        const confirmLogout = await Swal.fire({
          title: 'Yakin ingin logout?',
          text: 'Kamu akan keluar dari akun ini.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, logout',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
        });

        if (confirmLogout.isConfirmed) {
          getLogout();
          await Swal.fire({
            title: 'Logout Berhasil!',
            text: 'Kamu telah keluar dari akun.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          location.hash = '/login';
          this._setupLogoutButton();
        }
      });
    } else {
      button.textContent = '▶ Login';
      button.addEventListener('click', () => {
        location.hash = '/login';
      });
    }

    container.appendChild(button);

    window.addEventListener('hashchange', () => {
      this._setupLogoutButton();
    });
  }

  async #setupPushNotification() {
    const container = document.getElementById('push-notification-tools');
    if (!container) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    container.innerHTML = '';

    const btn = document.createElement('button');
    btn.id = isSubscribed ? 'unsubscribe-button' : 'subscribe-button';
    btn.textContent = isSubscribed
      ? 'Unsubscribe Notifications'
      : 'Subscribe Notifications';
    btn.className = isSubscribed
      ? 'push-button unsubscribe'
      : 'push-button';

    btn.addEventListener('click', async () => {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
      this.#setupPushNotification();
    });

    container.appendChild(btn);
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url] || routes['/'];

    if (url === '/login' || url === '/register') {
      page = checkUnauthenticatedRouteOnly(page);
    } else {
      page = checkAuthenticatedRoute(page);
    }

    if (!page) return;

    this.#content.innerHTML = await page.render();
    await page.afterRender();

    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
  }
}

export default App;
