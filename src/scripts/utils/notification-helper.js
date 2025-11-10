import { subscribeNotification, unsubscribeNotification } from '../data/api.js';
import { convertBase64ToUint8Array } from './index.js';
import { VAPID_PUBLIC_KEY } from '../config.js';
import Swal from 'sweetalert2';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

  if (!(await requestNotificationPermission())) {
    return { ok: false, message: 'Permission not granted' };
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    await Swal.fire({
      icon: 'info',
      title: 'Sudah Berlangganan!',
      confirmButtonColor: '#1a467bff',
    });
    return { ok: true };
  }

  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      await Swal.fire({
        icon: 'info',
        title: 'Service Worker Belum Terpasang',
        text: 'Pastikan service worker sudah aktif sebelum berlangganan notifikasi.',
        confirmButtonColor: '#1a467bff',
      });
      return { ok: false };
    }

    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());
    const { endpoint, keys } = pushSubscription.toJSON();

    const response = await subscribeNotification({ endpoint, keys });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: failureSubscribeMessage,
        confirmButtonColor: '#7b1a21ff',
      });
      await pushSubscription.unsubscribe();
      return { ok: false };
    }

    await Swal.fire({
      icon: 'success',
      title: 'Subscribe Berhasil!',
      text: successSubscribeMessage,
      confirmButtonColor: '#1a467bff',
    });
    return { ok: true };
  } catch (error) {
    console.error('subscribe: error:', error);
    try {
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }
    } catch (e) {
      console.error('Failed to undo subscription after error', e);
    }
    await Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan!',
      text: failureSubscribeMessage,
      confirmButtonColor: '#7b1a21ff',
    });
    return { ok: false };
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      await Swal.fire({
        icon: 'info',
        title: 'Belum Berlangganan',
        text: 'Tidak bisa memutus langganan karena belum berlangganan sebelumnya.',
        confirmButtonColor: '#1a467bff',
      });
      return { ok: false };
    }
    const { endpoint, keys } = pushSubscription.toJSON();

    const response = await unsubscribeNotification({ endpoint });
    if (!response.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: failureUnsubscribeMessage,
        confirmButtonColor: '#7b1a21ff',
      });
      console.error('unsubscribe: response:', response);
      return { ok: false };
    }

    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: failureUnsubscribeMessage,
        confirmButtonColor: '#7b1a21ff',
      });
      await subscribeNotification({ endpoint, keys });
      return { ok: false };
    }

    await Swal.fire({
      icon: 'success',
      title: 'Unsubscribe Berhasil!',
      text: successUnsubscribeMessage,
      confirmButtonColor: '#1a467bff',
    });
    return { ok: true };
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan!',
      text: failureUnsubscribeMessage,
      confirmButtonColor: '#7b1a21ff',
    });
    console.error('unsubscribe: error:', error);
    return { ok: false };
  }
}