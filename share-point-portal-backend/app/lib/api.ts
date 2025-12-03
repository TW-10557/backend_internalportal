const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    role: string
    theme_preference: string
    timezone: string
  }
  token: string
}

interface RequestOptions extends RequestInit {
  needsAuth?: boolean
}

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const { needsAuth = true, ...fetchOptions } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }

  if (needsAuth) {
    const token = localStorage.getItem("authToken")
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `HTTP Error: ${response.status}`)
  }

  return response.json()
}

// Authentication
export const authAPI = {
  register: (email: string, name: string, password: string) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
      needsAuth: false,
    }),

  login: (email: string, password: string): Promise<LoginResponse> =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      needsAuth: false,
    }),

  azureLogin: (token: string) =>
    apiRequest("/auth/azure-login", {
      method: "POST",
      body: JSON.stringify({ token }),
      needsAuth: false,
    }),

  getCurrentUser: () => apiRequest("/auth/me"),
}

// News
export const newsAPI = {
  getAll: (limit = 10, offset = 0, featured?: boolean) =>
    apiRequest(`/news?limit=${limit}&offset=${offset}${featured ? "&featured=true" : ""}`),

  getById: (id: string) => apiRequest(`/news/${id}`),

  create: (data: { title: string; content: string; category?: string; image_url?: string; tags?: string[] }) =>
    apiRequest("/news", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => apiRequest(`/news/${id}`, { method: "DELETE" }),
}

// Events
export const eventsAPI = {
  getAll: (limit = 20, offset = 0, upcoming = true) =>
    apiRequest(`/events?limit=${limit}&offset=${offset}&upcoming=${upcoming}`),

  getById: (id: string) => apiRequest(`/events/${id}`),

  create: (data: {
    title: string
    description?: string
    start_time: string
    end_time: string
    location?: string
  }) =>
    apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  rsvp: (id: string) => apiRequest(`/events/${id}/rsvp`, { method: "POST" }),

  update: (id: string, data: any) =>
    apiRequest(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// Documents
export const documentsAPI = {
  getAll: (limit = 20, offset = 0, category?: string) =>
    apiRequest(`/documents?limit=${limit}&offset=${offset}${category ? `&category=${category}` : ""}`),

  upload: (file: File, title?: string, category?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (title) formData.append("title", title)
    if (category) formData.append("category", category)

    return apiRequest("/documents/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for multipart
    })
  },

  share: (id: string, shared_with: string[]) =>
    apiRequest(`/documents/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ shared_with }),
    }),
}

// Announcements
export const announcementsAPI = {
  getAll: (limit = 10, offset = 0) => apiRequest(`/announcements?limit=${limit}&offset=${offset}`),

  create: (data: any) =>
    apiRequest("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Teams Integration
export const teamsAPI = {
  getChannels: () => apiRequest("/teams/channels"),

  getMessages: (channelId: string) => apiRequest(`/teams/channels/${channelId}/messages`),

  sync: () => apiRequest("/teams/sync", { method: "POST" }),
}

// User Management
export const usersAPI = {
  getProfile: () => apiRequest("/users/profile"),

  updateProfile: (data: any) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getPreferences: () => apiRequest("/users/preferences"),

  updatePreferences: (data: any) =>
    apiRequest("/users/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// WebSocket Connection
export function connectWebSocket(token: string): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  const wsUrl = `${protocol}//${window.location.host.replace(/:\d+/, ":5000")}?token=${token}`
  return new WebSocket(wsUrl)
}
