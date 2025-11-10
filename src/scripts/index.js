import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();
  await registerServiceWorker();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, url } = event.data || {};
      if (type === 'NAVIGATE' && url) {
        window.location.href = url;
      }
    });
  }

  window.addEventListener('hashchange', async () => {
    if (!document.startViewTransition) {
      await app.renderPage();
      return;
    }

    document.startViewTransition(async () => {
      await app.renderPage();
    });
  });
});
