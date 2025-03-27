import dotenv from 'dotenv';

dotenv.config();

export const rabitmqConfig = {
  RABBITMQ_URL: process.env.RABBITMQ_URL
};
