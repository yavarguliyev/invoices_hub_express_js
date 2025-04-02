import dotenv from 'dotenv';

dotenv.config();

const rabitmqConfig = {
  RABBITMQ_URL: process.env.RABBITMQ_URL
};

export { rabitmqConfig };
