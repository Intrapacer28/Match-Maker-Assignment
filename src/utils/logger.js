"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionLogger = exports.logger = void 0;
const winston = require("winston");
const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level} : ${message}`;
});

exports.logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Logger for big transactions
exports.transactionLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/transactions.log',
      level: 'info',
      format: combine(
        timestamp(),
        winston.format.json()
      ),
    }),
  ],
});
