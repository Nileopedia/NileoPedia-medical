import { Sequelize } from 'sequelize';
import { CONFIG } from '../../config/env';

let sequelizeInstance: Sequelize | null = null;

export const connectDB = async () => {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  sequelizeInstance = new Sequelize(CONFIG.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelizeInstance.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }

  return sequelizeInstance;
};

export const getDB = () => {
  if (!sequelizeInstance) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return sequelizeInstance;
};