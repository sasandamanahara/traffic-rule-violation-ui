/**
 * Application configuration
 * Base URL is loaded from environment variables
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default {
  API_BASE_URL,
};
