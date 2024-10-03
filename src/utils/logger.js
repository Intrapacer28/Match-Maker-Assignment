"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionLogger = exports.logger = void 0;
var winston = require("winston");
var _a = winston.format, combine = _a.combine, timestamp = _a.timestamp, printf = _a.printf, cli = _a.cli;
exports.logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), cli(), printf(function (info) { return "".concat(info.timestamp, " ").concat(info.level, " : ").concat(info.message); })),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
    ],
});
//logger for big tranasctions
exports.transactionLogger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), cli(), printf(function (info) { return "".concat(info.timestamp, " ").concat(info.level, " : ").concat(info.message); })),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/transactions.log',
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
    ],
});
