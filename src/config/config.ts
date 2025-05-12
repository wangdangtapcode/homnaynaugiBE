import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import * as path from 'path';

export const configValidationSchema = Joi.object({
  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_DATABASE: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.number().default(3600),

  // Server
  PORT: Joi.number().default(3001),
  
  // AI service - mặc định trong src/ai
  AI_SERVICE_PATH: Joi.string().default(path.join(process.cwd(), 'src', 'ai')),
});

export default registerAs('app', () => ({
  database: {
    host: process.env.DB_HOST || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expirationTime: process.env.JWT_EXPIRATION_TIME 
      ? parseInt(process.env.JWT_EXPIRATION_TIME, 10) 
      : 3600,
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  },
  ai: {
    servicePath: process.env.AI_SERVICE_PATH || path.join(process.cwd(), 'src', 'ai'),
  },
}));