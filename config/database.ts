import { Sequelize } from 'sequelize';
import config from './constants';

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    port: config.DB_PORT, // Add port (critical!)
    dialect: 'mysql',
    dialectOptions: {
      ssl: { // Required for Aiven
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 60000 // Increase timeout
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;