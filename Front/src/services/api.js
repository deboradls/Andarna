const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message[0] : body.message || 'Não foi possível concluir a solicitação.');
  return body;
}

export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  googleLogin: () => { window.location.assign(`${API_URL}/auth/google`); },
};

export const libraryApi = {
  searchBooks: (query) => request(`/books/search?q=${encodeURIComponent(query)}`),
  shelves: () => request('/shelves'),
  createShelf: (data) => request('/shelves', { method: 'POST', body: JSON.stringify(typeof data === 'string' ? { name: data } : data) }),
  library: (params = {}) => request(`/library?${new URLSearchParams(params)}`),
  addBook: (payload) => request('/library', { method: 'POST', body: JSON.stringify(payload) }),
  updateStatus: (id, status) => request(`/library/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateBookDetails: (id, details) => request(`/library/${id}`, { method: 'PATCH', body: JSON.stringify(details) }),
  addToShelf: (id, shelfId) => request(`/library/${id}/shelves`, { method: 'POST', body: JSON.stringify({ shelfId }) }),
  removeFromShelf: (id, shelfId) => request(`/library/${id}/shelves/${shelfId}`, { method: 'DELETE' }),
};
