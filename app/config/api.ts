// API configuration for backend connectivity
export const API_CONFIG = {
  // Use environment variable or fallback to local API
  BASE_URL: process.env.BACKEND_URL || '',
  
  // API endpoints
  ENDPOINTS: {
    BATCHES: '/api/batches',
    BATCH_RUN: (id: string) => `/api/batches/${id}/run`,
    BATCH_STATUS: (id: string) => `/api/batches/${id}/status`,
    BACKEND_HEALTH: '/health',
    BACKEND_TRIGGER: (type: string) => `/trigger/${type}`,
  },
  
  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
}

// Helper function to get the correct API URL
export function getApiUrl(endpoint: string): string {
  // If we have a backend URL configured, use backend endpoints for certain calls
  if (API_CONFIG.BASE_URL && (endpoint.includes('/trigger/') || endpoint === '/health')) {
    return `${API_CONFIG.BASE_URL}${endpoint}`
  }
  
  // Otherwise use local Next.js API routes
  return endpoint
}

// Backend integration helper
export const BACKEND_CONFIG = {
  URL: process.env.BACKEND_URL || 'http://35.247.166.100:8080',
  HEALTH_ENDPOINT: '/health',
  TRIGGER_EQUITY: '/trigger/equity',
  TRIGGER_STARTUP: '/trigger/startup',
}
