const config = {
    // Server configuration
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  
    // Database configuration
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    DB_NAME: process.env.DB_NAME || 'bitespeed',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
  
    // Application constants
    PRIMARY_CONTACT: 'primary' as const,
    SECONDARY_CONTACT: 'secondary' as const,
  
    // API paths
    BASE_API_PATH: '/api',
    IDENTIFY_ENDPOINT: '/identify',
  
    // Response messages
    SUCCESS_MESSAGE: 'Contact information processed successfully',
    ERROR_MESSAGES: {
      DATABASE_CONNECTION: 'Failed to connect to database',
      INVALID_REQUEST: 'Invalid request payload',
      SERVER_ERROR: 'Internal server error',
    },
  
    // Validation patterns
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/, // E.164 format
  };
  
  export default config;
  export const PORT = config.PORT;
  