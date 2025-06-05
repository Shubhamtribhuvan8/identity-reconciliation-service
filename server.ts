import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import sequelize from './config/database';
import { PORT } from './config/constants';

// Connect to DB and then start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false }); // Or true for dev reset
    console.log('✅ Connected and synced with the database');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1); // Exit the process with failure
  }
};

startServer();
