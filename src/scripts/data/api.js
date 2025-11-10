import CONFIG from '../config';
import { getAccessToken } from '../utils/auth.js';

const ENDPOINTS = {
  // auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // stories
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORE_STORY: `${CONFIG.BASE_URL}/stories`,
  STORE_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,

  // notifications
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function getRegister({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories({ page = 1, size = 10, location = 0 } = {}) {
  const token = getAccessToken();

  const url = `${ENDPOINTS.STORIES}?page=${page}&size=${size}&location=${location}`;
  const fetchResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}

export async function addNewStory({ description, photo, lat, lon }) {
  const token = getAccessToken();

  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const fetchResponse = await fetch(ENDPOINTS.STORE_STORY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}

export async function addNewStoryGuest({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const fetchResponse = await fetch(ENDPOINTS.STORE_STORY_GUEST, {
    method: 'POST',
    body: formData,
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}

export async function getStoryDetail(id) {
  const token = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}

export async function subscribeNotification({ endpoint, keys }) {
  const token = getAccessToken();
  const data = JSON.stringify({ endpoint, keys });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribeNotification({ endpoint }) {
  const token = getAccessToken();
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  const jsonResponse = await fetchResponse.json();

  return {
    ...jsonResponse,
    ok: fetchResponse.ok,
  };
}
