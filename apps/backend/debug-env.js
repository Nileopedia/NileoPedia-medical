const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
console.log('env:', env);
dotenv.config({ path: `.env.${env}` });

// If file doesn't exist, fall back to .env
if (env !== 'development') {
  dotenv.config({ path: '.env' });
}

// Check DATABASE_URL
console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL);

// Now export CONFIG like in env.ts
const CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
};
console.log('CONFIG.DATABASE_URL:', CONFIG.DATABASE_URL);
