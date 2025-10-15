// Adapter configuration for books-ui frontend
// This file can be used to configure API endpoints and other settings

export const config = {
  // API base URL configuration
  apiBaseUrl: '/api',

  // API endpoints
  endpoints: {
    books: '/books',
    health: '/health'
  },

  // Application settings
  app: {
    name: 'McMasterful Books',
    version: '1.0.0'
  }
};

// Export default configuration
export default config;