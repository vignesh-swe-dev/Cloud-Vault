import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: config.isDev ? 'debug' : 'info',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.Console({
      format: config.isDev ? combine(colorize(), simple()) : combine(timestamp(), json()),
    }),
  ],
});
