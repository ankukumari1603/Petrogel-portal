const API_BASE = import.meta.env.VITE_API_URL || '/api'

const endpointMap = {
  customers: 'customers', products: 'products', formulations: 'formulations', production: 'production', qc: 'qc', laboratory: 'lab', inventory: 'inventory', requirements: 'requirements', alerts: 'alerts',
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || `Request failed with status ${response.status}`)
  return payload
}

// List endpoints are expected to return an array. Some server responses may wrap it
// (e.g. `{ alerts: [...] }` or `{ data: [...] }`), so unwrap defensively instead of
// letting a non-array value reach the UI where `.filter()`/`.map()` would throw.
function toRecordArray(payload, type) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload[type])) return payload[type]
  if (payload && Array.isArray(payload.data)) return payload.data
  return []
}

export const api = {
  getHealth: () => request('/health'),
  getDashboard: () => request('/dashboard'),
  list: async (type) => toRecordArray(await request(`/${endpointMap[type]}`), type),
  create: (type, record) => request(`/${endpointMap[type]}`, { method: 'POST', body: JSON.stringify(record) }),
  update: (type, id, record) => request(`/${endpointMap[type]}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(record) }),
  remove: (type, id) => request(`/${endpointMap[type]}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export { API_BASE }
